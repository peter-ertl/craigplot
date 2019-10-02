
// interactive diversity plot

var cx,cy;
var rsize = 6;
var imgwidth = 150; var imgheight = 110;
var BGCOLOR = "#eaeaea";
var MENU_RESET = 1, MENU_DOWNLOAD = 2, MENU_OPTIONS = 3, MENU_INFO = 4;
var TOUCH = 1, MARK = 2, LEGEND = 3;
var rtag = Math.sqrt(imgwidth*imgwidth + imgheight+imgheight) * 0.8;
var g,g2; // graphics
var touched = -1; // touched point
var tagborder = 5; var tagshadow = 10;
var menudark = false; // indicates menu touch
var menu = null;
var xdown = -1;
var ydown = -1;
var zooming = false;
var showLegend = true;
var showAxes = true;
var pids = []; // only points with ids in pids will be drawn
var zerox,zero,unitx,unity,tickx,ticky; // for axes
var minaxx,maxaxx,minaxy,maxaxy;
var craigset = ["00001","00002","00003","00005","00006","00007","00008","00009","00010","00013","00014","00017","00018","00020","00024","00027","00031","00059","00065","00067","00087","00091","00124","01135","02114","06278"];
//var imgserver = "http://molecule.nibr.novartis.net/";
var imgserver = "https://peter-ertl.com/molecular/substituents/";
var doCraig = false;

$(document).ready(function(){
  // this makes page non-scrollable (otherwise x,y messed-up)
  $("html,body").css({overflow: 'hidden', height: '100%', margin:0, padding:0});
  cx = document.body.clientWidth;
  cy = document.body.clientHeight;

  // add menu image
  menu = new Image();
  //menu.src = "menu4.png";
  menu.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAYCAQAAACv4DAfAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfjCAYIDC9AaPR8AAADeUlEQVRYw92Xz0tUURTHPzPVjELkBLUoqCAwxiS0X+gmIlr2Awm0omhRi5EU6g8wnH4YkQSVE7mwNlGLQl1IbYIWUYtqssFFhEplKm3EotJx3ticFvN8vfvm/SJHos5dvXPPvfec8773e86F/1biC7RvkBJKKaWEYDG2W+w407pAQWzjBCFA4zYvPK3DHKSOrawCPpOklwdk/B0kiK8AxDT8yHk0BEGjzdP2EOPK/oIwRoP7os10MkhGN48XLYCADqC75BCEHHd1EAUcoHYTQegnRjkhQmygkRSCkHCCXyldlniLE8Ai9tNOLRH2MmxYD7OPCDVcpo5FBWtuIkxzoiANMdIICXv3nyKkucIWwkWF0Fr6yTLBc77o+c//gy88Z4Isb1hXAB5hmh22u+0kjVBfONGF8IlKw7Hf7i+bVwBLaNNxP+d4hjQ/TRqNNoVOwowjSvbV3RsRRglZsS+kDffNDLSej2yaRwDVJtgI33lEC8308NWkHaLKtOIYQn/BKWYgpRCOqMd0IlyxdeASwg2bOiEOwwq8SpLM6nNTtLAcgDJO8U3XzpI0pQ56EGKuwD2J8EBVDSJscWBu4Z1tqfPjPgSJ0ouGkOMxKw19hD5yCBq9RBVeGUEodw0givBBVWUQwrbGJYhD8Yj7cD8vu5lE0DhvIs0ArWgIk+y2WGuIBeFWgIbnfAqa8oQDigOOM3HOKt9nPXlrVvkKFbPEDyJstp3ZjvDWpWfyyn6QCgNCfUQM/Qoek0PI2kJog+sfqEB4X1g4Ltg6cB2hw7Xtc68Zlbw2LvE3TlMGBFjOGaaMS/yKjaYV3QiNrgE0I9xXj6limLU2JFpNhpwLjeat3aCj0uhXummihYf8MGkHFRo9ipBSWgwrjQ4gHLYetFTJ6dzh406F27cs4aJSyH6SJmOqyEKGc5ZCNmYhUjWAJoQR5xuUh0Qp27lOBuGJAzv5l3UMkGWCZ5ZWYlJvJZKssaxoQEiz03a3XcwgHPC+lPlDEg7ui8sobObquEyNpZkbYg8Ramlnn00zl0BIE7P0qgGamEG4hierzPCWDp8thFcA5nb6ntFO3/FopxMIQoqTRAkTpoJmBhCEq+6vubjvx8mfyEXjQXPO07ae0YLkjKjgCTiE0OowM3+p4bj+pLzFS0/rEPXUsY3VwDhJeulG+5tP+qI/6v95+QVbQvzAXfsxeAAAAABJRU5ErkJggg==";


  $("#canvas").mousemove(function(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.pageX - rect.left;
    var y = e.pageY - rect.top;

    if (e.which == 1) { // left button pressed
      if (!zooming) {
        if (xdown==-1 && ydown==-1) return; // too fast movement
        // very small drags ignored
        var dx = Math.abs(x-xdown);
        var dy = Math.abs(y-ydown);
        if (dx < 10 && dy < 10) return;

        zooming = true;
        // clearing touched and glass canvas
        $("#tags").empty();
        g2.clearRect(0,0,cx,cy);
        $("#pop").css({visibility:'hidden'});
      }      
      // redrawing glass canvas with selection rectangle
      //g2.clearRect(0,0,cx,cy);
      redrawGlassCanvas();
      g2.strokeStyle = "black";
      g2.beginPath();
      g2.rect(xdown,ydown,x-xdown,y-ydown);
      g2.stroke();
    }
    else {
      $("html,body").css("cursor","pointer");
      // x and y are relative to canvas
      updateTouch(x,y);
    }
  });

  $("#canvas").mouseleave(function(e) {
    updateTouch(-1,-1);
  });

  $("#canvas").mousedown(function(e) {
    var rect = canvas.getBoundingClientRect();
    xdown = e.pageX - rect.left;
    ydown = e.pageY - rect.top;
  });

  $("#canvas").mouseup(function(e) {
    if (zooming) { // end of zooming
      zooming = false;
      // get only zoomed subset in the rectangle
      var rect = canvas.getBoundingClientRect();
      var x = e.pageX - rect.left;
      var y = e.pageY - rect.top;
      minxrect = Math.min(x,xdown);
      maxxrect = Math.max(x,xdown);
      minyrect = Math.min(y,ydown);
      maxyrect = Math.max(y,ydown);

      pd = [];
      for (var i=0;i<p.length;i++) {
        p[i].mark = false;
        if (p[i].x < minxrect || p[i].x > maxxrect) continue;
        if (p[i].y < minyrect || p[i].y > maxyrect) continue;
        pd.push(i);
      }
      if (pd.length < 10) {
        alert("Too few molecules selected (only " + pd.length + "), select at least 10!");
        g2.clearRect(0,0,cx,cy);
        return;
      }
      pids = pd;

      // redrawing zoomed subset  
      scalePoints();
      drawAll();
    }

  });

  $("#canvas").click(function(e) { // or mousedown?
    var rect = canvas.getBoundingClientRect();
    var x = e.pageX - rect.left;
    var y = e.pageY - rect.top;
    updateClick(x,y,e);
  });

  $("body").on("mousemove",".tag",function(e) {
    $(this).draggable();
    var rect = canvas.getBoundingClientRect();
    var x = e.pageX - rect.left;
    var y = e.pageY - rect.top;
    // need to hide all molpops
    
    $("html,body").css("cursor","move");
    // redrawing glass canvas - connections to all tags

    redrawGlassCanvas();

  });

  // tag all molecules
  // keypress not working for Esc, but keyup yes
  $("body").keyup(function(e) {
    //console.log(e.keyCode,e.which,e.key);
    if(e.key=='t'|| e.key=='T') { // t(ag)
      if (pids.length > 500) {
        alert("Molecule images can be displayed for max. 500 structures!");
        return;
      }
      showLegend = false;
      for (var n=0;n<pids.length;n++) {
        i = pids[n];
        p[i].mark = true;
      }
      drawAll();
      showTags();
    }
    if(e.key=='c' || e.key=='C') {
      showCraigPlot();
    }
    if(e.key=='a' || e.key=='A') {
      // marking all visible points
      //drawAll(); // not, this removes marks
      for (var n=0;n<pids.length;n++) {
        i = pids[n];
        p[i].mark = true;
      }
      drawAll();
    }
    if(e.key == 'Escape') { // Esc
      resetAll();
    }
  });

  // options changed - update plot
  $("#opt-submit").click(function(e) {
    // remove tags and close pop-ups
    $("#tags").empty();

    // n most common
    doCraig = false;
    var upto = $("#opt-upto option:selected").text();
    if (upto == "all") upto = p.length;
    if (upto == "Craig set") {upto = p.length; doCraig = true;}

    var types = $("#opt-type").val();
    
    // attached to
    var ats = $("#opt-attachedto").val();
    if (ats == "all" || ats.length == 0) ats = [0];

    // natoms
    var natoms = $("#opt-natoms option:selected").text();
    if (natoms == "all" ) natoms = 15;

    
    // marking points according to the options
    pd = []
    for (var i=0;i<upto;i++) {
      p[i].mark = false;
      if (p[i].na > natoms) continue;
      if (doCraig) {
        if (!craigset.includes(p[i].id)) continue; 
      }
      else {
        if (i > upto) break;
      }

      if (types != null && parseInt(types[0]) != 0) {
        var ok = false;
        for (var j=0;j<types.length;j++) {
          if (p[i].t == parseInt(types[j])) ok = true;
        }
        if (!ok) continue;
      }


      if (parseInt(ats[0]) != 0) {
        var ok = false;
        for (var j=0;j<ats.length;j++) {
          for (var k=0;k<p[i].at.length;k++) {
            if (p[i].at[k] == parseInt(ats[j])) {ok = true; break;}
          }
        }
        if (!ok) {
          continue;
        }
      }
      pd.push(i);
    }

    if (pd.length < 10) {
      alert("Too few substituents selected (only " + pd.length + ") - change the options");
      g2.clearRect(0,0,cx,cy);
      return;
    }
    pids = pd;

    if ($("#opt-legend").is(':checked')) showLegend = true;
    else showLegend = false;

    if ($("#opt-axes").is(':checked')) showAxes = true;
    else showAxes = false;

    if ($("#opt-smallimg").is(':checked')) {imgwidth=90; imgheight=66;}
    else {imgwidth=150; imgheight=110;}

    $("#options").dialog('close');

    //console.log("OPTIONS",upto,types,ats,natoms);
    //console.log("OPTIONS",showLegend,showAxes,imgwidth);

    // redrawing subset  
    scalePoints();
    drawAll();
  }); // end options changed

  $("#opt-cancel").click(function(e) {
    $("#options").dialog('close');
  });

  $("#opt-reset").click(function(e) {
    $("#options").dialog('close');
    resetAll();
  });

  // browser resize
  $(window).on('resize', function() {
    // this sometimes wotking sometims not
    cx = document.body.clientWidth;
    cy = document.body.clientHeight;

    g.canvas.width = cx;
    g.canvas.height = cy; 
    g2.canvas.width = cx;
    g2.canvas.height = cy; 

    scalePoints();
    drawAll();

    //location.reload(); // reset all, how to keep current selection?
  });

  // colors
  for (var i=0;i<p.length;i++) {
    if (!p[i].t) {p[i].t = "#0000ff";} // !!! check 
  }

  var canvas =  $("#canvas")[0];
  var canvas2 =  $("#canvas2")[0];
  g = canvas.getContext('2d')
  g2 = canvas2.getContext('2d')
  g.canvas.width = cx;
  g.canvas.height = cy;
  g2.canvas.width = cx;
  g2.canvas.height = cy;

  resetAll();
  menu.onload = function() {
    drawMenu();
  }

});

function drawTagLines() {
  // called from redrawGlassCanvas - always cleans background
  // draw only shadow and line

  g2.strokeStyle = "black";
  g2.lineWidth = 2;
  g2.setLineDash([3,3]);

  $("#tags").children().each(function(i) {
    var tag = $(this);
    var tpos = tag.position();
    var torg = this.id.substring(3); // id of tag origin
    var xc = tpos.left + imgwidth/2;
    var yc = tpos.top + imgheight/2;
    // line
    g2.beginPath();
    g2.moveTo(p[torg].x,p[torg].y);
    g2.lineTo(xc,yc);
    g2.stroke();

    // shadow
    g2.fillStyle = "gray";
    g2.globalAlpha = 0.7;
    var b = 10 * imgwidth / 150. ;
    g2.fillRect(tpos.left+b,tpos.top+b,imgwidth,imgheight);
  });

  g2.globalAlpha = 1;
  g2.lineWidth = 1;
  g2.setLineDash([]);
}

function scalePoints() {
  // scaling points stored in pids
  var minx = Number.MAX_VALUE; var maxx = -Number.MAX_VALUE; var miny =  Number.MAX_VALUE; var maxy = -Number.MAX_VALUE;
  for (var n=0;n<pids.length;n++) {
    var i = pids[n];
    // adding also mark info
    //p[i].mark = false; // needs to keep for resize
    p[i].x = p[i].p; p[i].y = p[i].s; // pi,hammett => x,y
    p[i].y = -p[i].y // nitro should by at the top as in Craig's plot
    if (p[i].x < minx) minx = p[i].x;
    if (p[i].x > maxx) maxx = p[i].x;
    if (p[i].y < miny) miny = p[i].y;
    if (p[i].y > maxy) maxy = p[i].y;
  }

  var lenx = maxx - minx;
  var leny = maxy - miny;
  minaxx = minx;
  maxaxx = maxx;
  minaxy = miny;
  maxaxy = maxy;
  var border = 15;
  var bordert = border; var borderb = border; var borderl = border; var borderr = border;
  if (doCraig) { // special borders for Criag plot with tabs
    bordert = 50; borderb = 100; borderl = 150; borderr = 60;
  }

  for (var i=0;i<p.length;i++) {
    var x = borderl + (p[i].x -minx) * (cx - borderl - borderr) / lenx;
    p[i].x = x;
    var y = bordert + (p[i].y -miny) * (cy - bordert - borderb) / leny;
    p[i].y = y;
  }
  zerox = borderl - minx * (cx - borderl - borderr) / lenx;
  zeroy = bordert - miny * (cy - bordert - borderb) / leny;
  unitx = borderl + (1. - minx) * (cx - borderl - borderr) / lenx - zerox;
  unity = bordert + (1. - miny) * (cy - bordert - borderb) / leny - zeroy;
  var nx = cx / unitx;
  var ny = cy / unity;
  if (nx > 5) tickx = 1.;
  else if (nx > 1.5) tickx = 0.5;
  else tickx = 0.2;
  if (ny > 5) ticky = 1.;
  else if (ny > 2.0) ticky = 0.5;
  else if (ny > 0.5) ticky = 0.2;
  else ticky = 0.1;
}

function drawCircle(x,y,color,type) {
  // shaded drawing (up to 3 colors and touch)
  var c,cdark;
  var gg = g;
  var rr = rsize;
  if (type == TOUCH) {
    c = "red";
    cdark = "#660000";
    gg = g2;
    rr = rsize + 2;
  }
  else if (type == MARK) { // marked are drawn to g2
    c = "magenta";
    cdark = "#306";
    gg = g2;
  }
  else if (type == LEGEND) { // legend circles painted on g2
    gg = g2;
    c = color;
    cdark = darkenColor(c);
  }
  else { // 10 shaded colors
    c = color;
    cdark = darkenColor(c);
  }

  // gradient     
  var grd = g.createRadialGradient(x-rr/3.,y-rr/3.,rr*.7,x,y,rr * 1.5);
  grd.addColorStop(0,c);
  grd.addColorStop(1,cdark);
  gg.beginPath();
  gg.fillStyle = grd;
  gg.arc(x,y,rr,0,2*Math.PI);
  gg.fill();

  // white reflex
  gg.fillStyle = "white"
  gg.beginPath();
  gg.arc(x-rr/3.,y-rr/3.,rr/4.,0,2*Math.PI);
  gg.fill();
          
  // circle around
  gg.strokeStyle = cdark;
  gg.beginPath();
  gg.arc(x,y,rr,0,2*Math.PI);
  gg.stroke();
}

function getTouchedPoint(x,y) {

  // points
  rsizeplus = rsize + 20;
  rsize2plus = (rsize + 20) * (rsize + 20); // ???
  min = 999;
  t = -1;
  for (var i=0;i<p.length;i++) {
    dx = p[i].x - x;
    if (Math.abs(dx) > rsizeplus) continue;
    dy = p[i].y - y;
    if (Math.abs(dy) > rsizeplus) continue;
    d = dx * dx + dy * dy;
    if (d < rsize2plus) {
      if (d < min) {
        min = d;
        t = i;
      }
    } 
  }
  return t;
}

function updateTouch(x,y) {
  var m = checkMenu(x,y);
  if (menudark && !m) {
    // cleaning menu - !!! redraw points that may be there
    g2.fillStyle = BGCOLOR;
    g2.fillRect(5,5,24*4,24);
    g2.drawImage(menu,5,5);
    menudark = false;
  }

  var t = getTouchedPoint(x,y);
  if (t == touched) return; // no action necessary
  if (touched > -1) {
    if (p[touched].mark) {
      drawCircle(p[touched].x,p[touched].y,color[p[touched].t],MARK);
    }
    else {
      // returning previously touched to normal
      redrawGlassCanvas();
    }
    $("#pop").css({visibility: 'hidden'});
  }
  if (t > -1) {
    drawCircle(p[t].x,p[t].y,color[p[t].t],TOUCH);
    // molecule pane
    // where to place it
    dx = p[t].x - cx/2;
    dy = p[t].y - cy/2;
    rx = Math.sqrt(dx * dx + dy * dy);
    ex = rtag * dx / rx
    ey = rtag * dy / rx
    px = p[t].x + ex - imgwidth / 2;
    py = p[t].y + ey - imgheight / 2;
    // checking for placing outside borders
    if (py < 0) {
      py = 0;
      px = p[t].x - 20 -imgwidth;
      if (p[t].x > cx/2) px = p[t].x + 20;
    }
    if (py+imgheight > cy) {
      py = cy-imgheight;
      px = p[t].x - 20 -imgwidth;
      if (p[t].x > cx/2) px = p[t].x + 20;
    }
    // check x-axis for border crossing
    if (px < 0) {
      px = p[t].x + 50;
    }
    if (px + imgwidth > cx) {
      px = p[t].x - imgwidth - 50;
    }

    // pop molimage
    // need to check whether this tag exists
    var tagid = "tag" + t;
    if ($("#"+tagid).length) {
      // visited existing tag
      touched = t;
      return;
    }

    var imgid = p[t].id.substring(0,2) + "/" + p[t].id + ".png"
    url = imgserver + "/rimages/" + imgid
    $("#molimage").attr("src",url).width(imgwidth).height(imgheight);

    var molpop = $("#pop");
    molpop.css({position:'fixed',left:px,top:py, visibility: 'visible', 'z-index':9}); // molecule pop always on top

  }
  touched = t;
}

function checkMenu(x,y) {
   // border 5, icon size 24
   if (x < 5) return 0;
   if (x > 5 + 24*4) return 0;
   if (y > 5 + 24) return 0;
   if (y < 5) return 0;
   menudark = true;
   g2.fillStyle = BGCOLOR;
   g2.fillRect(5,5,24*4,24);
   g2.fillStyle = "#bbb";
   if (x < 30) {
     g2.fillRect(5,5,24,24);
     g2.drawImage(menu,5,5);
     return MENU_RESET;
   }
   else if (x < 54) {
     g2.fillRect(5+24,5,24,24);
     g2.drawImage(menu,5,5);
     return MENU_DOWNLOAD;
   }
   else if (x < 78) {
     g2.fillRect(5+24*2,5,24,24);
     g2.drawImage(menu,5,5);
     return MENU_OPTIONS;
   }
   else {
     g2.fillRect(5+24*3,5,24,24);
     g2.drawImage(menu,5,5);
     return MENU_INFO;
   }
}

function updateClick(x,y,e) {
  var m = checkMenu(x,y);
  if (m == MENU_RESET) {
    resetAll();
    return;
  }
  else if (m == MENU_DOWNLOAD) {
    downloadSelectedMols();
    return;
  }
  else if (m == MENU_OPTIONS) {
    $("#options").css({visibility:'visible'});
    $("#options").dialog({width:550, height:580});
    return;
  }
  else if (m == MENU_INFO) {
    $("#info").css({visibility:'visible'});
    $("#info").dialog({width:620, height:520});
    return;
  }

  // checking touch of point or tag
  var t = getTouchedPoint(x,y);
  if (t == -1) return;
  // marking or deleting existing mark
  if (p[t].mark) {
    p[t].mark = false;
    drawCircle(p[t].x,p[t].y,color[p[t].t],0);
    // removesing this tag if existing
    var tagid = "tag" + t;
    if ($("#"+tagid).length) { // element exists
      //console.log("tag point click");
      $("#"+tagid).remove();
    }
    return;
  }
  // select/mark point
  p[t].mark = true;
  drawCircle(p[t].x,p[t].y,color[p[t].t],MARK);

  if (!e.shiftKey) return; 
  var pos = $("#pop").position();
  drawTag(t,pos.left,pos.top); // set tag paramters
  redrawGlassCanvas(); // must be called, otherwise shade top left

  $("#pop").css({visibility: 'hidden'});
  // adding tag to the list of tags
  //tags.push({"n":t,"id":tagid,"top":pos.top,"left":pos.left});

}

function redrawGlassCanvas() {
  g2.clearRect(0,0,cx,cy);

  drawMenu();

  if (showLegend) drawLegend();
  if (showAxes) drawAxes();

  // drawing all marked
  for (var i=0;i<p.length;i++) {
    if (!p[i].mark) continue;
    drawCircle(p[i].x,p[i].y,color[p[i].t],MARK);
  }
  drawTagLines();

  // frame around
  g2.strokeStyle = "black";
  g2.lineWidth = 1;
  g2.rect(1,1,cx-2,cy-2);
  g2.stroke();
}

// draws molecule tag (after shift click or programatically)
function drawTag(t,left,top) {

  var lt = moveTagFromBorder(left,top);
  //left = lt[0]; top = lt[1];

  // adding new fixed panel
  var tagid = "tag" + t;
  var imgid = "img" + t;
  var tag = '<div id=' + tagid + ' class="tag" style="width:' + imgwidth + 'px; height:' + imgheight + 'px; border: 1px solid black;"><img id=' + imgid + '></img></div>';

  $("#tags").append(tag); // necessary to become visible
  // need to store also origin (molecule position) of this tag

  var imgname = p[t].id.substring(0,2) + "/" + p[t].id + ".png"
  url = imgserver + "/rimages/" + imgname;
  $("#"+imgid).attr("src",url).width(imgwidth).height(imgheight);
  $("#"+tagid).css({position:'fixed',left:left,top:top,visibility:'visible','z-index':3});
}

function moveTagFromBorder(left,top) {
  if (left < tagborder) left = tagborder;
  if (top < tagborder) top = tagborder;
  if (left + imgwidth + tagborder + tagshadow > cx) left = cx - imgwidth -tagborder;
  if (top + imgheight + tagborder + tagshadow > cy) top = cy - imgheight - tagshadow -tagborder;
  return [left,top];
}

// showing tags over the points
function showTags() {
  $("#tags").empty(); // removing old (if any)

  var n = -1;
  var tp = new Object();
  var tag2p = new Object();
  for (var i=0;i<pids.length;i++) {
    var ii = pids[i];
    if (!p[ii].mark) continue;
    n++;
    tp[n] = new Object();
    tp[n].x = p[ii].x;
    tp[n].y = p[ii].y;
    tag2p[n] = ii;
  }
  var ntags = n+1;
  if (ntags == 0) {
    //alert("No molecules selected");
    return;
  }

  avoidTagOverlap(ntags,tp,tag2p);
  for (var n=0;n<ntags;n++) {
    // tp[] coordinates are in top left corner
    // drawing with middle of the tag over the point
    drawTag(tag2p[n],tp[n].x-imgwidth/2, tp[n].y-imgheight/2);
  }
  redrawGlassCanvas();
}

function showCraigPlot() {
  resetAll();
  // ??? strange, old JQuery ??? // need to be opened first
    $("#options").css({visibility:'visible'});
    $("#options").dialog({width:550, height:580});
    $("#options").dialog('close');

  //var upto = $("#opt-upto").setText("Craig set");
  $("#opt-upto").prop('selectedIndex',7);
  $("#opt-legend").prop('checked',false);
  $("#opt-axes").prop('checked',true);
  $("#opt-submit").click();
  // mark items
  for (var n=0;n<pids.length;n++) {
    i = pids[n];
    p[i].mark = true;
  }
  console.log("CP",pids.length);
  showTags();
}

function avoidTagOverlap(ntags,tp,tag2p) {
  // tp is center point
  var maxsteps = 100;
  if (ntags > 200) maxsteps = 20;
  if (ntags > 500) maxsteps = 1;
  if (ntags > 1000) maxsteps = 0;

  var imgw2 = imgwidth / 2.;
  var imgh2 = imgheight / 2.;

  // initial removel from borders
  for (var i=0;i<ntags;i++) {
    if (tp[i].x -imgw2 < tagborder) tp[i].x = tagborder + imgw2;
    if (tp[i].x + imgw2 + tagborder + tagshadow > cx) tp[i].x = cx - tagborder -tagshadow - imgw2;
    if (tp[i].y - imgh2 < tagborder) tp[i].y = tagborder + imgh2;
    if (tp[i].y + imgh2 + tagborder + tagshadow > cy) tp[i].y = cy - tagborder -tagshadow - imgh2;

  }


  // keep the original position
  var op = new Object();
  for (var i=0;i<ntags;i++) {
    op[i] = new Object();
    op[i].x = tp[i].x;
    op[i].y = tp[i].y;
  }

  var wp = imgwidth *.8; // allowed overlap
  var hp = imgheight *.9;
  var m = 10; // initial move - is then decreased
  for (var step=0;step<maxsteps;step++) {
    if (step > 10) m = 2;
    for (var i=0;i<ntags-1;i++) {
      for (var j=i+1;j<ntags;j++) {

        
        // need to move
        // but must not move too much from the original pos (op)
        // moving max imwidth from the op
        var dx = tp[i].x - tp[j].x;
        var dy = tp[i].y - tp[j].y;

        if (Math.abs(dx) > wp) continue;
        if (Math.abs(dy) > hp) continue;

        // saving positio in case it goes over border
        var oix = tp[i].x;
        var oiy = tp[i].y;
        var ojx = tp[j].x;
        var ojy = tp[j].y;

        var ratio = (Math.abs(dx) + Math.abs(dy)) / 10.;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) { // 2 points overlap exactly
          dx = m; dy = m; ratio = 1.;
        }
        tp[i].x += dx / ratio;
        tp[j].x -= dx / ratio;

        tp[i].y += dy / ratio;
        tp[j].y -= dy / ratio;

        // check going beyound borders
        // align with moveTagFromBorder
        if (tp[i].x -imgw2 < tagborder) tp[i].x = tagborder + imgw2;
        if (tp[i].x +imgw2 +tagborder+tagshadow > cx) tp[i].x = cx - tagborder -tagshadow - imgw2;
        if (tp[j].x -imgw2 < tagborder) tp[j].x = tagborder + imgw2;
        if (tp[j].x +imgw2 + tagborder + tagshadow > cx) tp[j].x = cx - tagborder - tagshadow - imgw2;
        if (tp[i].y - imgh2 < tagborder) tp[i].y = tagborder + imgh2;
        if (tp[i].y + imgh2 + tagborder + tagshadow > cy) tp[i].y = cy - tagborder -tagshadow - imgh2;
        if (tp[j].y - imgh2 < tagborder) tp[j].y = tagborder + imgh2;
        if (tp[j].y + imgh2 + tagborder + tagshadow > cy) tp[j].y = cy - tagborder -tagshadow - imgh2;

        // check distance from origin
        var maxr = imgw2;
        var dx = tp[i].x - op[i].x; 
        var dy = tp[i].y - op[i].y; 
        var r = Math.sqrt(dx*dx + dy * dy);
        if (r > maxr) {tp[i].x = oix, tp[i].y = oiy;}
        var dx = tp[j].x - op[j].x; 
        var dy = tp[j].y - op[j].y; 
        var r = Math.sqrt(dx*dx + dy * dy);
        if (r > maxr) {tp[j].x = ojx, tp[j].y = ojy;}

        var dx = tp[i].x - tp[j].x;
        var dy = tp[i].y - tp[j].y;
      }
    }
  }
}

function downloadSelectedMols() {
  var n = 0;
  var s = "SMILES\tHansch pi\tHammett sigma p\n"
  for (var i=0;i<p.length;i++) {
    if (p[i].mark) {
      n += 1;
      s += p[i].smi + "\t" + p[i].id + "\t" + p[i].p + "\t" + p[i].s + "\n";
    }
  }
  if (n == 0) {
    alert("No molecules selected");
    return;
  }

  var molwin = window.open("","Selected molecules","height=400,width=650,scrollbars=yes,toolbar=no,menubar=no,status=no,titlebar=no,resizable=yes,left=100,top=100")
  var doc = molwin.document;
  doc.open("text/html");
  doc.write("<pre>"+s+"</pre>");
  doc.close();
}

function drawAll() {

  g.fillStyle = BGCOLOR;
  g.fillRect(0,0,cx,cy);
  
  // keeping subset
  /*
  for (var i=0;i<p.length;i++) {
    p[i].mark = false;
  }
  */
  touched = -1;
  $("#pop").css({visibility:'hidden'});

  // redraw all
  for (var n=0;n<pids.length;n++) {
    i = pids[n];
    drawCircle(p[i].x,p[i].y,color[p[i].t],0);
  }
  // g2
  redrawGlassCanvas();

  if ($("#tags").children().length > 0) showTags();
}

function resetAll() {
  resetOptions(); // but they are not read!

  // remove selection and tags
  $("#tags").empty();
  g2.clearRect(0,0,cx,cy);

  pids = []
  for (var i=0;i<p.length;i++) pids[i] = i;
  scalePoints();

  g.fillStyle = BGCOLOR;
  g.fillRect(0,0,cx,cy);

  // draw points
  if (typeof rrsize != 'undefined') rsize = rrsize;
  for (var i=0;i<p.length;i++) {
    drawCircle(p[i].x,p[i].y,color[p[i].t],0);
  }

  redrawGlassCanvas();
}

function drawMenu() {
  
  // info
  var info = pids.length + " substituents";
  g2.font = "22px Arial";
  var w = g2.measureText(info).width; // need to know w of the bg rectangle

  // rectangle below 
  g2.fillStyle = BGCOLOR;
  g2.globalAlpha = 0.8;
  g2.fillRect(0,0,24*4+w+25,52);
  g2.globalAlpha = 1;

  g2.fillStyle = BGCOLOR;
  g2.fillRect(5,5,24*4,24);
  g2.drawImage(menu,5,5);
  
  // info
  var info = pids.length + " substituents";
  g2.fillStyle = "black";
  g2.fillText(info,114,25);

  g2.font = "14px Arial";
  g2.fillStyle = "black";
  g2.fillText("Substituent plot v2019.09, by Peter Ertl",8,45);
}

// reset the option pane
function resetOptions() {
  $("#opt-type").prop('selectedIndex',0);
  $("#opt-upto").prop('selectedIndex',0);
  $("#opt-attachedTo").prop('selectedIndex',0);
  $("#opt-natoms").prop('selectedIndex',0);
  $("#opt-legend").prop('checked',true);
  $("#opt-axes").prop('checked',true);
  $("#opt-smallimg").prop('checked',false);

  $("#options").dialog();
  $("#opt-submit").click();
  $("#options").dialog('close');

  doCraig = false;
  showLegend = true;
  showAxes = true;
  imgwidth = 150; imgheight = 110;
}

function drawLegend() {
  // on g or g2 ???
  if (typeof legend == 'undefined') return; 
  if (cx < 650) {
    console.log("screen too small to drawlegend");
    return; 
  }

  g2.font = "20px Arial";
  g2.fillStyle = "black";
  var legh = legend.length * 24 + 20;
  var x = 35;
  var y = cy-12-legy; 
  maxw = 0;
  for (var i=0;i<legend.length;i++) {
    var w = g2.measureText(legend[i][1]).width;
    if (legend[i][0] == "#") w -= 40; // no circle
    if (w > maxw) maxw = w;
  }
  var legw = maxw + 60;
  // position of the legend
  var legb = 20; // border
  var legx = legb;
  var legy = cy - legb - legh;
  legx = cx - legw - legb;
  legy = legb;

  // legend position bottom left
  if (typeof legpos !== 'undefined' && legpos == "bl") {
    legx = legb;
    legy = cy - legh - legb; 
  }
  // legend position top left (below info line)
  if (typeof legpos !== 'undefined' && legpos == "tl") {
    legx = legb;
    legy = legb + 20; 
  }
  
  // rectangle below legend
  g2.fillStyle = BGCOLOR;
  g2.globalAlpha = 0.8;
  var b = 3;
  g2.fillRect(legx-b,legy-b,legw+2*b,legh+2*b);
  g2.globalAlpha = 1;
  
  // frame around the canvas
  g2.strokeStyle = "black";
  g2.beginPath(); // must be here
  g2.rect(legx,legy,legw,legh);
  g2.stroke();

  var y = legy-2;
  for (var i=0;i<legend.length;i++) {
    var group = legend[i][0]
    y += 24;
    if (legend[i][0] == "#") { // header info, ni circle
      g2.fillStyle = "black";
      g2.fillText(legend[i][1],legx+10,y+7);
    }
    else { // normal circle + legend
      drawCircle(legx+22,y,color[group],LEGEND)
      g2.fillStyle = "black";
      g2.fillText(legend[i][1],legx+40,y+7);
    }
  }

}

function drawAxes() {

  g2.font = "20px Arial";
  g2.fillStyle = "black";

  // x axis (pi)
  for (var x=-5;x<=5;x+=tickx) {
    var xx = zerox + x*unitx;
    if (xx > cx - 20) continue;
    if (xx < 20) continue;
    g2.beginPath();
    g2.moveTo(xx,cy);
    g2.lineTo(xx,cy-10);
    g2.stroke();

    var text = x.toFixed(1);
    var w = g2.measureText(text).width;
    g2.fillText(text,xx-w/2.,cy-18);
  }

  // y axis (Hammett)
  // revert sign !
  for (var y=-2;y<=2;y+=ticky) {
    var yy = zeroy + y*unity;
    if (yy > cy -20) continue;
    if (yy < 55) continue;
    g2.beginPath();
    g2.moveTo(0,yy);
    g2.lineTo(10,yy);
    g2.stroke();

    var text = (-y).toFixed(1);
    //var w = g2.measureText(text).width;
    g2.fillText(text,16,yy+5);
  }

  var text = "Hansch pi";
  var w = g2.measureText(text).width;
  g2.fillText(text,cx-w-50,cy-45);

  text = "Hammett sigma p";
  g2.save();
  g2.rotate(-Math.PI/2);
  g2.fillText(text, -240, 65);
  g2.restore();

}

function darkenColor(color) {   
  var percent = -50;
  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}
