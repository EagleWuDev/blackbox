from flask import Flask, request, jsonify, abort, g, render_template
from werkzeug.utils import secure_filename
from bson import ObjectId
from web3 import Web3, IPCProvider
from datetime import datetime
import ipfsapi
import os
import ffmpy
import pymongo
import json

app = Flask(__name__)

CONTRACT_ABI_STRING_JSON = '[{"constant":true,"inputs":[],"name":"getCar","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getHash","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_ipfsHash","type":"string"},{"name":"_carId","type":"string"}],"payable":false,"type":"constructor"}]'
CONTRACT_CODE =  '60606040523461000057604051610489380380610489833981016040528080518201919060200180518201919050505b8160009080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061007b57805160ff19168380011785556100a9565b828001600101855582156100a9579182015b828111156100a857825182559160200191906001019061008d565b5b5090506100ce91905b808211156100ca5760008160009055506001016100b2565b5090565b50508060019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061011c57805160ff191683800117855561014a565b8280016001018555821561014a579182015b8281111561014957825182559160200191906001019061012e565b5b50905061016f91905b8082111561016b576000816000905550600101610153565b5090565b50505b50505b610305806101846000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063ca04c83414610049578063d13319c4146100df575b610000565b3461000057610056610175565b60405180806020018281038252838181518152602001915080519060200190808383600083146100a5575b8051825260208311156100a557602082019150602081019050602083039250610081565b505050905090810190601f1680156100d15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34610000576100ec610227565b604051808060200182810382528381815181526020019150805190602001908083836000831461013b575b80518252602083111561013b57602082019150602081019050602083039250610117565b505050905090810190601f1680156101675780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b602060405190810160405280600081525060018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561021c5780601f106101f15761010080835404028352916020019161021c565b820191906000526020600020905b8154815290600101906020018083116101ff57829003601f168201915b505050505090505b90565b602060405190810160405280600081525060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102ce5780601f106102a3576101008083540402835291602001916102ce565b820191906000526020600020905b8154815290600101906020018083116102b157829003601f168201915b505050505090505b905600a165627a7a72305820d3aff3569fd1a9fe55d124d9295c33b4a0fc44f0604972952599ea7e1f2ef5c70029'
ACCOUNT_PASSWORD = '1'

web3 = Web3(IPCProvider())
web3.personal.newAccount(ACCOUNT_PASSWORD)
web3.personal.unlockAccount(web3.eth.accounts[0], ACCOUNT_PASSWORD)
web3.miner.start(1)


@app.before_request
def before_request():
    g.ipfs_api_conn = ipfsapi.connect('localhost', 5001)

    client = pymongo.MongoClient()
    g.mongo_collection = client['streamchain']['test_collection']

    g.web3 = Web3(IPCProvider())

    g.web3.personal.unlockAccount(g.web3.eth.accounts[0], ACCOUNT_PASSWORD)

    g.eth_contract_factory = g.web3.eth.contract(json.loads(CONTRACT_ABI_STRING_JSON), code=CONTRACT_CODE)


@app.route('/index')
def index():
    documents = g.mongo_collection.find({})
    data = []

    for doc in documents:
        if 'transactionId' in doc:
            data.append(
                {
                    **doc,
                    **getHashAndCarFromTransaction(doc['transactionId'])
                }
            )

    return render_template('index.html', entries=data)


@app.route('/recent')
def recent():
    documents = g.mongo_collection.find({})
    data = {
        'data': [

        ]
    }

    for doc in documents:
        if 'transactionId' in doc:
            data['data'].append(
                getHashAndCarFromTransaction(doc['transactionId'])
            )

    return jsonify(data)


def getHashAndCarFromTransaction(transactionId):
    receipt = g.web3.eth.getTransactionReceipt(transactionId)
    if receipt is None:
        return {}

    contract = g.eth_contract_factory(address=receipt['contractAddress'])

    block = g.web3.eth.getBlock(receipt['blockHash'])

    return {
        'ipfs': contract.call().getHash(),
        'carId': contract.call().getCar(),
        'timestamp': datetime.fromtimestamp(block['timestamp'])
    }


@app.route('/record_finished', methods=['POST'])
def record_finished():
    if 'video' not in request.files and 'carId' not in request.form:
        abort(400)

    source_file = request.files['video']

    # create a blank mongo record and get the id for creating a unique local folder
    # the document will be used for saving the ipfs add result hash
    token = str(g.mongo_collection.insert_one({}).inserted_id)

    target_file = os.path.join('data/video', token, secure_filename(source_file.filename))

    os.makedirs(os.path.dirname(target_file), exist_ok=True)

    source_file.save(target_file)

    # for ipfs video player support, must have file in directory named 'video.mp4'
    ff = ffmpy.FFmpeg(
        inputs={target_file: None},
        outputs={os.path.join(os.path.dirname(target_file), 'video.mp4'): '-strict -2'}
    )

    ff.run()

    # add to ipfs
    ipfs_folder_to_add = os.path.dirname(target_file)
    ipfs_add_res = g.ipfs_api_conn.add(ipfs_folder_to_add, recursive=True)

    # since adding the folder only works randomly, just save the video url
    folder_obj = None
    for item in ipfs_add_res:
        if item['Name'].endswith('video.mp4'):
            folder_obj = item

    # insert into ethereum chain as a contract
    transaction_id = g.eth_contract_factory.deploy(args=[folder_obj['Hash'], request.form['carId']])

    g.mongo_collection.update_one(
        {
            '_id': ObjectId(token)
        },
        {
            '$set': {
                'carId': request.form['carId'],
                'data': folder_obj,
                'transactionId': transaction_id
            }
        }
    )

    return 'you did it'


if __name__ == '__main__':
    app.run('0.0.0.0', 5000, debug=False)