
pragma solidity ^0.4.0;
contract CarCrash {

   string ipfsHash;
   string carId;
   
   function CarCrash(string _ipfsHash, string _carId) public {
       ipfsHash = _ipfsHash;
       carId = _carId;
   }
   
   function getHash() constant returns (string) {
       return ipfsHash;
   }
   
   function getCar() constant returns (string) {
       return carId;
   }
}