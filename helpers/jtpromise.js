var _ = require('lodash');


exports.wrap = wrap;


function wrap(){
  var args = _.toArray(arguments);
  var fn = args.shift();
  return new Promise(function(resolve, reject){
    var cbf = function(err, data){
      if(err){
        if(_.isError(err)){
          reject(err);
        }else{
          resolve(err);
        }
      }else{
        resolve(data);
      }
    };
    args.push(cbf);
    fn.apply(null, args);
  });
}