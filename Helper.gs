var Password = function(secret){
  if(typeof secret === 'undefined'){
    secret = 'Gjh5$321ki8&6xLk2jsjj*655w0kjdjh#gsgs?>jusgt5436777%%%43****0--=6Loi';
  }
  this.secret = this.base64Encode(secret)
}

Password.prototype.base64Encode=function(str){
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/g, '');
}

Password.prototype.base64Decode = function (str) {
  return JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(str, Utilities.Charset.UTF_8 )).getDataAsString());
};

//Library ID MSJnPeIon6nzdLewGV60xWqi_d-phDA33
Password.prototype.hash = function(str){
  return new cCryptoGS.Cipher(this.secret+this.base64Encode(str), 'TripleDES').encrypt(str);
}

Password.prototype.verify = function(str, hashed){
   return str === this.decrypt(str, hashed);
}

Password.prototype.decrypt = function(str, hashed){
  return new cCryptoGS.Cipher(this.secret+this.base64Encode(str), 'TripleDES').decrypt(hashed);
}