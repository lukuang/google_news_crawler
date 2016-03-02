var origin_wait = 5;
var LIMIT = 3600;
var PREVIOUS_SUCCESS = true;
var JSON_FILE_NAME = "protest"
document.getElementById("set_query").addEventListener("click",my_function);
function my_function() {

    var dest_url = "http://localhost:8080/crawl_handler"
    
    var file_name = "disaster_types/"+JSON_FILE_NAME+".json" 
    
    oForm = document.forms["crawler_form"]
    var url = oForm.elements["url"].value
    var response_text
    
    document_type = "tbm="+encodeURIComponent(oForm.elements["document_type"].value)
    //query = oForm.elements["query"].value.toLowerCase();
    //query = "q="+encodeURIComponent(query.replace(/ /,"+") )
    //start_date = oForm.elements["start_date"]
    //end_date = oForm.elements["end_date"]
    url_prefix = url+document_type
    page_id =  parseInt(oForm.elements["starting_pageid"].value,10);

    
    //request_url= compose_url(start_date,url_prefix,page_id)
    //file_name = start_date.value+"-"+page_id
    var now_wait = origin_wait;
    get_queries(file_name,url_prefix, dest_url,now_wait,delay_get);
    //get_result_page(start_date,end_date,url_prefix,page_id,request_url, dest_url,file_name,call_back_wrapper);
    //get_result_page(start_date,end_date,url_prefix,page_id,request_url, dest_url,file_name, now_wait,call_back_wrapper);
}



function get_queries(file_name,url_prefix,dest_url,now_wait,cb){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      //document.write(xhr.responseText)
      obj = JSON.parse(xhr.responseText)
      var count = Object.keys(obj).length
      document.write(count)
      document.write("</br>");
      document.write("</br>");
      document.write("</br>");
      obj_id = 0
      page_id = 0
      now_date = obj[obj_id].start_date;
      cb(obj,url_prefix,dest_url,obj_id ,page_id ,count,call_back_wrapper,now_date,now_wait)
      
      
      
      // innerText does not let the attacker inject HTML elements.
      //document.getElementById("resp").innerText = xhr.responseText;
      //console.log(xhr.responseText)
    }
    else if (xhr.readyState == 4 && xhr.status != 200){
      document.write("error in parsing "+file_name);
      document.write("</br>");
      document.write(Date())
      document.write("</br>");
      document.write(xhr.statusText);
      document.write("</br>");
      alert("STOPPED!")
    }


  }
  xhr.open("GET", chrome.extension.getURL(file_name), true);
  try{
    xhr.send();
  }catch (e){
    console.log("Couldn\'t load query.json")
  }
}

// function crawl_queries(obj,url,dest_url,obj_id ,page_id ,count){
//     delay_get(obj,url,dest_url,obj_id ,page_id ,count)
//       var query = obj[i].query_string.toLowerCase() 
//       query = "q="+encodeURIComponent(query.replace(/ /,"+") )
//       url_prefix =url+"&"+query
//     for(var k=0;k<=90;k+=10){
//       var get_url = compose_url(obj[i].start_date,obj[i].end_date,url_prefix,k)
//       document.write(get_url)
//       document.write("</br>")
//     }
//   }
// }



function compose_url(obj,obj_id,page_id,url_prefix,now_date){
  var query = obj[obj_id].query_string.toLowerCase() 
  query = "q="+encodeURIComponent(query.replace(/ /,"+") )
  url_prefix +="&"+query
  start_string = parse_date(now_date)
  end_string= parse_date(now_date)
  date_range = "tbs="+encodeURIComponent("cdr:1,cd_min:"+start_string+",cd_max:"+end_string)
      
  request_url= url_prefix+"&"+date_range+"&start="+page_id
  return request_url;
}



function delay_get(obj,url_prefix,dest_url,obj_id,page_id,count,call_back_wrapper,now_date,seconds){
  //setTimeout(function(){get_test(start_date,end_date,url_prefix,page_id,request_url, dest_url,file_name,call_back_wrapper);},milliseconds);
  //console.log("wait for "+seconds)
  setTimeout(function(){get_result_page(obj,url_prefix,dest_url,obj_id,page_id,count,now_date,seconds,call_back_wrapper);},seconds*1000);
  
  //document.write(asdasdasd);
  
}



function has_next(responseText){
  var doc = document.implementation.createHTMLDocument( 'html' );
  //console.log(responseText)
  doc.documentElement.innerHTML = responseText
  console.log()
  id = "pnnext"
  var has = doc.getElementById(id)
  return(typeof(has)!=undefined && has!=null)

}

function call_back_wrapper(obj,url_prefix,dest_url,obj_id,page_id,count,now_date, now_wait,responseText){
  //sleep(10000);
  end_date = obj[obj_id].end_date
  if (PREVIOUS_SUCCESS==true && now_wait!=origin_wait){
    now_wait = origin_wait;
    document.write("reset timer to "+now_wait);
    document.write("</br>");
  }
  
  if( !has_next(responseText) ){
    page_id = 90
  }

  if(page_id!=90){
    page_id+=10;
    delay_get(obj,url_prefix,dest_url,obj_id,page_id,count, call_back_wrapper,now_date,now_wait);   
  }
  else if(now_date!=end_date){
    page_id = 0;
    now_date_struct = new Date(now_date);
    now_date_struct.setDate(now_date_struct.getDate() + 1);
    var yyyy = now_date_struct.getFullYear().toString();
    var mm = (now_date_struct.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = now_date_struct.getDate().toString();
    now_date = yyyy + "/" +(mm[1]?mm:"0"+mm[0]) +"/"+ (dd[1]?dd:"0"+dd[0]);

    delay_get(obj,url_prefix,dest_url,obj_id,page_id,count, call_back_wrapper,now_date,now_wait);   
  }
  else if(obj_id<count-1){
    obj_id+=1;
    page_id = 0;
    now_date = parse_date(obj[obj_id].start_date)
    delay_get(obj,url_prefix,dest_url,obj_id,page_id,count, call_back_wrapper,now_date,now_wait);   
  }
  else{
    document.write("Finished!")
  }
}


function get_test(start_date,end_date,url_prefix,page_id,url,dest_url,file_name,cb){
  document.write("getting "+url);
  document.write("</br>");
  if( typeof cb === 'function' )
        cb(start_date,end_date,url_prefix,page_id,dest_url,file_name,"xx")
}

function post_test(dest_url,file_name,responseText){
  document.write("posting "+dest_url);
  document.write("</br>");
}


function get_result_page(obj,url_prefix,dest_url,obj_id,page_id,count, now_date,now_wait,cb){
  var xhr = new XMLHttpRequest();
  var get_url = compose_url(obj,obj_id,page_id,url_prefix,now_date)
  xhr.open("GET", get_url, true);
  console.log(get_url)
  dir_name = get_dir_name(obj,obj_id,page_id,now_date)
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      PREVIOUS_SUCCESS = true;
      post_data(dest_url,dir_name,page_id,xhr.responseText)
      // innerText does not let the attacker inject HTML elements.
      //document.getElementById("resp").innerText = xhr.responseText;
      //console.log(xhr.responseText)
      if( typeof cb === 'function' )
        cb(obj,url_prefix,dest_url,obj_id,page_id,count, now_date,now_wait, xhr.responseText)
    }
    else if(xhr.readyState == 4 && xhr.status != 200){
      PREVIOUS_SUCCESS = false;
      document.write("error in getting "+get_url);
      document.write("</br>");
      document.write("document name "+file_name);
      console.log("error in getting to "+get_url);
      document.write("</br>");
      document.write(Date())
      document.write("</br>");
      document.write(xhr.statusText);
      document.write("</br>");
      if(now_wait>=LIMIT){
        document.write(now_wait+" exceed maximum timeout!");
        alert("STOPPED!")
      }
      else{
        now_wait *= 2;
        document.write("restart for wait "+now_wait);
        document.write("</br>");
        delay_get(obj,url_prefix,dest_url,obj_id,page_id,count, call_back_wrapper,now_date, now_wait);
        //get_result_page(start_date,end_date,url_prefix,page_id,url,dest_url,file_name, now_wait,cb);
      }
      
      //alert("STOPPED!")
      //throw "";

    }

  }
  xhr.send();
}



function post_data(dest_url,dir_name,page_id,responseText){
  //console.log(responseText)
  var xhr = new XMLHttpRequest();
  var params = "f="+page_id+"&dir="+dir_name+"&d="+encodeURIComponent(responseText);
  xhr.open("post", dest_url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhr.setRequestHeader("Content-length", params.length);
  //xhr.setRequestHeader("Connection", "close");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // innerText does not let the attacker inject HTML elements.
      //document.getElementById("resp").innerText = xhr.responseText;
      //console.log(xhr.responseText)
    }
    else if(xhr.readyState == 4 &&xhr.status != 200){
      document.write("error in posting to "+dest_url);
      document.write("</br>");
      document.write(xhr.statusText);
      document.write("</br>");
      console.log("error in posting to "+dest_url);
      console.log(xhr.statusText);
      console.log("current file is "+file_name)
      alert("STOPPED!")
      throw "";
    }

  }
  xhr.send(params);
}

function parse_date(date_string){
  console.log(date_string)
  test = date_string.match(/(\d+)\/(\d+)\/(\d+)/);
  result = test[3]+"/"+test[1]+"/"+test[2]
  return result
}

function get_dir_name(obj,obj_id,page_id,now_date){
  query_string = obj[obj_id].query_string.replace(/ /g,"_")
  year = obj[obj_id].year
  date_string = parse_date(now_date)
  dir_name = JSON_FILE_NAME + "/"+year+"_"+query_string+"/"+date_string
  return dir_name
}

// function get_file_name(obj,obj_id,page_id){
//   query_string = obj[obj_id].query_string.replace(/ /g,"_")
//   year = obj[obj_id].year
//   file_name = JSON_FILE_NAME + "/"+year+"_"+query_string+"/"+page_id
//   return file_name
// }

