App.prototype.quizCreate=function(param){
  if(!param.name || !param.type || !param.course || !param.date || !param.start || !param.duration){
    return this.responseJson({message: 'Failed! name of quiz or course	or date or 	time or	duration undefined.', code: 401});
  }
  
  var name = param.name.toString();
  var course = parseInt(param.course);
  var date = new Date(param.date);
  var start = new Date(param.start);
  var duration = parseInt(param.duration)
  
//  var quiz = 
  		
  return this.responseJson({message: 'Failed! email or password undefined.', code: 401});
}