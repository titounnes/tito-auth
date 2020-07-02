var App = function(sheet_id, table){
  this.Spreadsheet = SpreadsheetApp.openById(sheet_id)
}
  
App.prototype.responseJson=function(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); 
}
        
App.prototype.login = function(param){
  if(!param.email || !param.password){
    return this.responseJson({message: 'Failed! email or password undefined.', code: 401});
  }
  
  var email = param.email.toString();
  var password = param.password.toString();
  
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(email)===false){
    return this.responseJson({message: 'Failed! email not valid.', code: 401});
  }
  if(param.password.toString() === ''){
    return this.responseJson({message: 'Failed! Password can not null.', code: 401});
  }

  var user = this.getData('user', email, 0);

  if(!user.result){
    return this.responseJson({message: 'Failed! Email '+email+' not found.', code: 401});
  }
  
  var Pass = new Password();
  if(!Pass.verify(password, user.result[1].toString())){
    return this.responseJson({message: 'Failed! Incorect password.', code: 401});
  }
  
  var token = Pass.hash(email.replace(/\@\./g,''));
  user.sheet.getRange(user.row, 3).setValue(token);
  return this.responseJson({message: 'Success! You have successfully logged in',token:token, code: 200});
}

App.prototype.register = function(param){
  if(!param.password || !param.email){
    return this.responseJson({message: 'Failed! Email or password undefined.', code: 401});
  }
  
  var email = param.email.toString();
  var password = param.password.toString();
  
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(email)===false){
    return this.responseJson({message: 'Failed! email not valid.', code: 401});
  }
  
  if(password.length < 8){
    return this.responseJson({message: 'Failed! Password is at least 8 characters.', code: 401});
  }
  
  var user = this.getData('user', email, 0);
  var Pass = new Password();
  
  if(user.result){
    return this.responseJson({message: 'Failed! Email '+email+' has been registered. Try another.', code: 401});
  }
  
  user.sheet.appendRow([email, Pass.hash(password)]);
  return this.responseJson({message: 'Success! You have registered.', code: 200});
}

App.prototype.changePassword = function(param){

  if(!param.email || !param.oldPassword || !param.newPassword){
    return this.responseJson({message: 'Failed! email or old password or new password undefined.', code: 401});
  }

  var email = param.email.toString();
  var oldPassword = param.oldPassword.toString();
  var newPassword = param.newPassword.toString();
  
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(email)===false){
    return this.responseJson({message: 'Failed! email not valid.', code: 401});
  }

  if(newPassword.length < 8){
    return this.responseJson({message: 'Failed! Password is at least 8 characters.', code: 401});
  }
  
  var user = this.getData('user', email, 0);
  if(!user.result){
    return this.responseJson({message: 'Failed! Email '+email+' not found.', code: 401});
  }

  var Pass = new Password();
  if(!Pass.verify(oldPassword, user.result[1].toString())){
    return this.responseJson({message: 'Failed! you have no authority.', code: 401});
  }
  
  user.sheet.getRange(user.row, 2).setValue(Pass.hash(newPassword));
  
  return this.responseJson({message: 'Sucess! Your has been changed.', code: 200});  
}

App.prototype.forgotPassword = function(param){
  var email = param.email.toString();
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(email)===false){
    return this.responseJson({message: 'Failed! email not valid.', code: 401});
  }
  
  var user = this.getData('user', email, 0);
  if(!user.result){
    return this.responseJson({message: 'Failed! Email '+email+' not found.', code: 401});
  }
  var Pass = new Password();
  var token = Pass.hash(email.replace(/\@\./g,''));
  var expirate = new Date();
  expirate.setDate(expirate.getDate() + 2)
  user.sheet.getRange(user.row, 4).setValue(token);
  user.sheet.getRange(user.row, 5).setValue(expirate);
  MailApp.sendEmail({to:email, subject:'Reset password', htmlBody:'This code <code>'+token+'</code> valid until '+expirate})
  return this.responseJson({message: 'Success! A code to reset the password has been sent by email.', code: 200});
}
 
App.prototype.resetPassword = function(param){

  if(!param.email || !param.password || !param.token){
    return this.responseJson({message: 'Failed! email or password or token undefined.', code: 401});
  }

  var email = param.email.toString();
  var password = param.password.toString();
  var token = param.token.toString();
  
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(email)===false){
    return this.responseJson({message: 'Failed! email not valid.', code: 401});
  }
  
  var user = this.getData('user', email, 0);
  if(!user.result){
    return this.responseJson({message: 'Failed! Email '+email+' not found.', code: 401});
  }

  if(user.result[3] !== token){
    return this.responseJson({message: 'Failed! Your token is not valid.', code: 401});
  }
  
  var expirate = (new Date(user.result[4])).getTime();
  var now = (new Date()).getTime();
  
  if(now > expirate){
    return this.responseJson({message: 'Failed! the token has expired.', code: 401});
  }
  
  if(password.length < 8){
    return this.responseJson({message: 'Failed! Password is at least 8 characters.', code: 401});
  }
  
  var Pass = new Password();
  user.sheet.getRange(user.row, 2).setValue(Pass.hash(password));
  
  return this.responseJson({message: 'Sucess! Your has been changed.', code: 200});  
}

App.prototype.getData = function(table, key, col){
  var sheet = this.Spreadsheet.getSheetByName(table);
  var userData = sheet.getRange(2, 1, sheet.getLastRow()-1,sheet.getLastColumn()).getValues();
  var result = null;
  var row = 1;
  for(var index in userData){
    if(userData[index][col]==key){
      result = userData[index];
      row = index*1+2;
      break;
    }
  }
  return { sheet: sheet, result: result, row: row};
}

function doPost(e) {
  var myApp = new App('10yoQHp5-m1k5-swgCN6ZL_0u1pzaqkMRk2SzU3gOUiA'); 
  if(! e.parameters.method){
    return myApp.responseJson({message:'Illegal request.'}); 
  }
  if(typeof myApp[e.parameters.method] !== 'function'){
    return myApp.responseJson({message:'Method '+e.parameters.method+' not found.'}); 
  }
  
  return myApp[e.parameters.method].apply(myApp, [e.parameters]);
}
