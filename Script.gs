my_token = '<>'

function fetchTraffic(sheet){
  //var sheet = SpreadsheetApp.getActive().getSheetByName('Sheet1')//SpreadsheetApp.getActiveSheet();
  var unrm = sheet.getRange("G2").getValue()
  importMoment()
  moment.tz.setDefault("Etc/UTC")//("Asia/Kolkata")  
  max = Math.max   
  
  var requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: {
    'Authorization': `token ${my_token}` 
    }
  };
  obj = {}
  var d = moment().toDate() 
  console.log(d.getTimezoneOffset())
  for(i=0;i<14;i++){       
    obj[d.toDateString()] = {"views":0,"u_views":0,"clones":0,"u_clones":0}
    d.setDate(d.getDate()-1) 
  }
  d.setDate(d.getDate()+1) 
  var response = UrlFetchApp.fetch("https://api.github.com/repos/"+unrm+"/traffic/views",requestOptions)
  obj1 = JSON.parse(response.toString())["views"]
  
  for(const [k,value] of obj1.entries()){
     key = parseDate(value["timestamp"]).toDateString()
     console.log(key.toLocaleString("en-IN", {timeZone: "UTC"}) + " " + value["timestamp"])
     if(!(key in obj)){
       obj[key]= {"views":0,"u_views":0,"clones":0,"u_clones":0}
       console.log(key+" <- Key Created")
     }
     obj[key]["views"] = max(obj[key]["views"],value["count"])
     obj[key]["u_views"] = max(obj[key]["u_views"],value["uniques"])
  }

  
  response = UrlFetchApp.fetch("https://api.github.com/repos/"+unrm+"/traffic/clones",requestOptions)
  obj2 = JSON.parse(response.toString())["clones"]
  for(const [k,value] of obj2.entries()){
     key = parseDate(value["timestamp"]).toDateString()
     obj[key]["clones"] = max(obj[key]["clones"],value["count"])
     obj[key]["u_clones"] = max(obj[key]["u_clones"],value["uniques"])
  }


 var r = sheet.getLastRow();
 while(r > 5 && parseDate(sheet.getRange(r,1).getValue())>d)r--;
 console.log(r);
 //return; 
 console.log("D"+d.toDateString())
 //console.log(obj)
 for(var k of Object.keys(obj).reverse()) {   
   console.log(typeof(v))
   v = obj[k]
   sheet.getRange(r,1).setValue(k);
   sheet.getRange(r,2).setValue(v["views"]);
   sheet.getRange(r,3).setValue( v["u_views"]);
   sheet.getRange(r,4).setValue(v["clones"]);
   sheet.getRange(r++,5).setValue( v["u_clones"]);
 }
}

function parseDate(a){
 importMoment()  
 return moment(a).tz("Etc/UTC").toDate()  
}

function importMoment(){
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js').getContentText())
  eval(UrlFetchApp.fetch('https://momentjs.com/downloads/moment-timezone-with-data.js').getContentText())
}
function buildChart(sheet){
  
  var lineChartBuilder = sheet.newChart().asLineChart();

  var chartDataRange = sheet.getRange(4,1,sheet.getLastRow(),5);
   var hAxisOptions = {
    slantedText: true,
    slantedTextAngle: 60,
    gridlines: {
      count: 12
    }
  };

  var chart = lineChartBuilder
    .addRange(chartDataRange)
    .setPosition(4, 7, 0, 0)
    .setTitle('Date-wise STATS')
    .setNumHeaders(1)
    .setLegendPosition(Charts.Position.RIGHT)
    //.setOption('hAxis', hAxisOptions)
    .setOption("useFirstColumnAsDomain", true)
    .build();
 
  sheet.insertChart(chart);  
}

function master(){
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for(sheet of sheets){
    fetchTraffic(sheet)
    if(sheet.getCharts().length==0)
      buildChart(sheet)    
  }
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}
