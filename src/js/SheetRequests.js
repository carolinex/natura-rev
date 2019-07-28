import * as d3 from "d3";

export function getId(callback){
  d3.json("getrow")
  .then(function(resp){
    console.log(resp);
    callback(resp)
  })
}

export function saveData(formValues, callback){
  d3.json("save?values="+formValues)
  .then(function(resp){
    console.log(resp);
    callback();
  })
}
