/**
 * Created by L on 2021/6/4.
 */
var over=0;   //标识游戏是否结束，若为1表示结束，若为0表示还未结束
var uncover_lattice=0;        //记录点开的格子数，当为格子总数时游戏结束
var start_time;     //记录游戏开始时间
var lev = 0;    //记录游戏难度
var firstclick=0;        //记录是否是第一次点击左键，为1时表示是，为0表示否

window.onload=function() {
    var level = new Array("简单", "一般", "困难", "地狱");
    var size = new Array(3);       //分别用来存储行、列、炸弹数（因为要根据难度来设置所以设为数组）

    //当按下开始游戏按钮时
    document.getElementById("start_btn").onclick = function () {
        SetSize(lev, size);         //设置行、列和炸弹数
        CreatInterface(size);       //创建游戏界面
        document.getElementById("button").style.display = "none";
        firstclick=1;
        over=0;        //over=0标志游戏开始
        start_time=new Date().getTime();
        window.setInterval("ShowTime()",1000);
        for(var i=1;i<=size[0]*size[1];i++){
            document.oncontextmenu=function(){return false;}       //设置鼠标右击无法拉出菜单
            function cov(){
                var position=i;               //采用闭包的方式传输i，若不用闭包，则传输的i为最后数，而不是触发点击事件的方格位置数
                document.getElementById("div"+position).onmousedown=function(event){      //鼠标单击事件
                    Uncover(event.button,position,size);
                }
                document.getElementById("div"+position).ondblclick=function(){             //鼠标双击事件
                    if(document.getElementById("div"+position).getAttribute("style")=="text-indent:0px"){     //只对已经被点开的格子有效
                        DoubleClick(position,size);
                    }
                }
            }
            cov();
        }
        document.getElementById("flag_num").innerHTML=size[2];
        SetShortestTime();
    }

    //选择游戏难度
    document.getElementById("left_btn").onclick = function () {
        lev = (lev + 3) % 4;
        document.getElementById("level").innerHTML = level[lev];
    }
    document.getElementById("right_btn").onclick = function () {
        lev = (lev + 1) % 4;
        document.getElementById("level").innerHTML = level[lev];
    }

    //游戏说明
    document.getElementById("explain_btn").onclick = function () {
        document.getElementById("explain").style.display = "flex";
    }
    //返回
    document.getElementById("return").onclick = function () {
        document.getElementById("explain").style.display = "none";
    }
    //重新开始
    document.getElementById("reset_btn").onclick=function(){
        over=1;
        uncover_lattice=0;
        document.getElementById("button").style.display = "flex";
        document.getElementById("main").innerHTML="";
        document.getElementById("time").innerHTML="";
    }
    //按下旗子按钮
    document.getElementById("flag").onclick=function(){
        if(document.getElementById("flag_btn").style.backgroundColor=="#A1A3A6"){
            document.getElementById("flag_btn").style.backgroundColor="#D3D7D4";
        }
        else {
            document.getElementById("flag_btn").style.backgroundColor="#A1A3A6";
        }
    }
}

//设置行、列和炸弹数函数
function SetSize(lev,size){
    switch (lev){
        case 0:  //难度为简单
            size[0]=10;size[1]=10;  //行、列为10
            size[2]=10+Math.floor(10*Math.random());    //10<炸弹数<20
            break;
        case 1:  //难度为一般
            size[0]=20;size[1]=20;   //行、列为20
            size[2]=40+Math.floor(40*Math.random());  //40<炸弹数<80
            break;
        case 2:  //难度为困难
            size[0]=30;size[1]=30;  //行、列为30
            size[2]=90+Math.floor(90*Math.random());   //90<炸弹数<180
            break;
        default:  //难度为地狱
            size[0]=50;size[1]=50;
            size[2]=250+Math.floor(250*Math.random());  //250<炸弹数<500
            break;
    }
}

//创建游戏界面函数
function CreatInterface(size){
    document.getElementById("main").style.width=22*size[1]+"px";   //自动调整整个main的界面宽度
    for(var i=1;i<=size[0]*size[1];i++){
        var e=document.createElement("div");
        e.setAttribute("class","lattice");
        e.setAttribute("id","div"+i);
        e.innerHTML=0;
        document.getElementById("main").appendChild(e);
    }
}

//放置炸弹函数
function PutBomb(position,size){
    var i=1;
    while(i<=size[2]){
        var pos=Math.floor(size[0]*size[1]*Math.random())+1;        //找一个随机位置,因为0<=Math.random()<1,所以要+1防止选到0
        var num=document.getElementById("div"+pos).innerHTML;   //该位置的数字
        if(num!=-1&&pos!=position){        //如果该位置没有炸弹，且该位置不是第一次点击的位置，则放置炸弹
            document.getElementById("div"+pos).innerHTML=-1;
            ++i;
        }
    }
}

//设置每一个位置的值函数
function SetValue(size){
    var row=size[0],col=size[1];
    for(var i=1;i<=row;i++){   //行数
        for(var j=1;j<=col;j++){   //列数
            var val=document.getElementById("div"+((i-1)*row+j)).innerHTML;
            if(val!=-1){             //如果该位置的值不是-1（即该位置没有放炸弹），则对该位置进行赋值
                var count=0;      //记录位置周围9个方格的炸弹数
                for(var m=1;m<=3;m++){
                    for(var n=1;n<=3;n++){
                        if(i-3+m>=0&&i-3+m<=row-1&&j-2+n>=1&&j-2+n<=col){
                            var num=(i-3+m)*row+j-2+n;
                            var value=document.getElementById("div"+num).innerHTML;
                            if(value==-1){
                                ++count;
                            }
                        }
                    }
                }
                document.getElementById("div"+((i-1)*row+j)).innerHTML=count;    //令该位置的值等于周围炸弹数
            }
        }
    }
}

//当方格被点开的函数
function Uncover(button,position,size){
    if(firstclick==1){
        PutBomb(position,size);        //放置炸弹
        SetValue(size);       //设置每一个位置的值
        firstclick=0;
    }
    var e=document.getElementById("div"+position);
    var val= e.innerHTML;
    if(over==0){             //游戏未结束才能点开格子或放旗子
        if(button==0){   //如果按下的是鼠标左键
            if(val==-1){          //当按到的是炸弹时，触发炸弹爆炸效果
                over=1;     //标志游戏结束，无法进行点格子或放旗子的操作
                Blast(position);         //调用炸弹爆炸函数
                window.setTimeout("GameOver(0)",3000);   //游戏结束
            }
            else if(val==0){     //当按到的位置值为0时，自动显示周围9个方格的值，若其中有值为0的方格，也显示其周围9个方格的值，递归下去
                ChooseZero(position,size);
            }
            else if(val>0){                  //当按到的位置值>0时，且该位置未显示，显示该位置的值
                if(e.getAttribute("style")!="text-indent:0px"){
                    ++uncover_lattice;
                    e.setAttribute("style","text-indent:0px");
                }
            }
        }
        else if(button==2){      //如果按下的是鼠标右键
            var s=document.getElementById("div"+position).getAttribute("style");
            if(size[2]>=1&&s!="text-indent:0px"){                   //如果可放置旗子的数量>=1且该格子没有被点开
                var x=e.offsetTop;       //获取该位置在父元素中的top位置
                var y= e.offsetLeft;     //获取该位置在父元素中的left位置
                var f=document.createElement("img");     //设置旗子图片覆盖该位置(不直接插入该位置中是因为要保留该位置原来的值)
                f.setAttribute("src","image/flag2.jpg");
                f.setAttribute("class","flag2");
                f.setAttribute("id","flag"+position);
                f.setAttribute("style","position:absolute;top:"+(x+1)+"px;"+"left:"+(y+1)+"px;");
                document.getElementById("main").appendChild(f);
                --size[2];        //可放置旗子数减1
                ++uncover_lattice;
                document.getElementById("flag_num").innerHTML=size[2];
                f.onmousedown=function(e){
                    if(e.button==2){
                        f.style.display="none";
                        ++size[2];
                        --uncover_lattice;
                        document.getElementById("flag_num").innerHTML=size[2];
                    }
                }
            }
        }
    }
    if(uncover_lattice==size[0]*size[1]){
        over=1;     //标志游戏结束，此时计时停止，且无法点开格子或放旗子
        GameOver(1);
    }
}

//按到0时候的函数
function ChooseZero(position,size){
    var row=size[0],col=size[1];
    ++uncover_lattice;
    document.getElementById("div"+position).innerHTML=-2;      //将该处数值改为-2，防止之后周围0格子调用ChooseZero函数时访问该格子时造成循环
    document.getElementById("div"+position).setAttribute("style","box-shadow:2px 2px 2px inset");   //按到的位置显示凹陷效果
    var i=Math.ceil(position/col),j=position%col;
    if(j==0){j=col;}
    //访问该位置周围8个子格子，若子格子中的数值>0则显示该位置数值，若为0，则将该子格子的位置作为position参数调用ChooseZero函数
    for(var m=-1;m<=1;m++){
        for(var n=-1;n<=1;n++){
            if(i-1+m>=0&&i-1+m<=row-1&&j+n>=1&&j+n<=col){
                var pos=(i-1+m)*row+j+n;
                var value=document.getElementById("div"+pos).innerHTML;
                var s=document.getElementById("div"+pos).getAttribute("style");
                if(value>0&&s!="text-indent:0px"){
                    ++uncover_lattice;
                    document.getElementById("div"+pos).setAttribute("style","text-indent:0px");
                }
                else if(value==0){
                    ChooseZero(pos,size);
                }
            }
        }
    }
}

//炸弹爆炸函数
function Blast(position){
    var old=document.getElementById("div"+position).firstChild;
    var im=document.createElement("img");
    im.setAttribute("src","image/bomb1.jpg");
    im.setAttribute("class","bomb");
    document.getElementById("div"+position).replaceChild(im,old);    //用图像代替原来的数字
    document.getElementById("div"+position).setAttribute("style","text-indent:0px");
    im.setAttribute("style","animation:blast 2s ease-in");         //添加图像的缩放动画
    window.setTimeout(function(){im.setAttribute("src","image/bomb2.jpg");},2000);   //原图像缩放完成后用新图像代替
}

//游戏结束函数，参数result为1表示正常结束，为0表示是点到炸弹结束
function GameOver(result){
    var time=new Date().getTime()-start_time;
    if(result==0){
        window.alert("你输了！\n请重新开始！");
    }
    else {
        window.alert("你赢了！\n用时："+document.getElementById("time").innerHTML);
        if(localStorage.getItem("shortest_time"+lev)==null||time<localStorage.getItem("shortest_time"+lev)){
            localStorage.setItem("shortest_time"+lev,time);
        }
    }
    uncover_lattice=0;
    document.getElementById("button").style.display = "flex";
    document.getElementById("main").innerHTML="";
    document.getElementById("time").innerHTML="";
}

//显示游戏所用时间
function ShowTime(){
    if(over==0){      //如果游戏正在进行中，则函数可以进行，防止游戏结束之后下一次游戏开始之前时间仍在变化
        var time=new Date().getTime()-start_time;
        var second=Math.floor(time/1000)%60,minute=Math.floor(time/60000)%60,hour=Math.floor(time/3600000);
        var sTime="";
        if(hour<10){
            sTime+="0"+hour+"时";
        }
        else {
            sTime+=hour+"时";
        }
        if(minute<10){
            sTime+="0"+minute+"分";
        }
        else {
            sTime+=minute+"分";
        }
        if(second<10){
            sTime+="0"+second+"秒";
        }
        else {
            sTime+=second+"秒";
        }
        document.getElementById("time").innerHTML=sTime;
    }
}

//显示最短时间
function SetShortestTime(){
    if(localStorage.getItem("shortest_time"+lev)!=null){
        var time=localStorage.getItem("shortest_time"+lev);
        var second=Math.floor(time/1000)%60,minute=Math.floor(time/60000)%60,hour=Math.floor(time/3600000);
        var sTime="";
        if(hour<10){
            sTime+="0"+hour+"时";
        }
        else {
            sTime+=hour+"时";
        }
        if(minute<10){
            sTime+="0"+minute+"分";
        }
        else {
            sTime+=minute+"分";
        }
        if(second<10){
            sTime+="0"+second+"秒";
        }
        else {
            sTime+=second+"秒";
        }
        document.getElementById("shortest_time").innerHTML=sTime;
    }
    else {
        document.getElementById("shortest_time").innerHTML="";
    }
}

//双击事件函数
function DoubleClick(position,size){
    var row=size[0],col=size[1];
    var i=Math.ceil(position/col),j=position%col;
    if(j==0){j=col;}
    var cover=new Array;    //用于存储position周围未被点开的格子的位置
    var uncover_num=-1,flag_num=0;    //uncover_num用于记录position周围被点开的格子的数量,为-1是因为要加上position自己正好为0，flag_num用于记录position周围放置的旗子数
    for(var m=-1;m<=1;m++){
        for(var n=-1;n<=1;n++){
            if(i-1+m>=0&&i-1+m<=row-1&&j+n>=1&&j+n<=col){
                var pos=(i-1+m)*row+j+n;
                var value=document.getElementById("div"+pos).innerHTML;
                var s=document.getElementById("div"+pos).getAttribute("style");
                if(document.getElementById("flag"+pos)!=null&&document.getElementById("flag"+pos).style.display!="none"){      //如果pos处有旗子
                    ++flag_num;      //则flag_num加1
                }
                else if(s!="text-indent:0px"&&value!=-2){    //如果pos未被点开
                    cover.push(pos);             //将pos的位置插入数组cover中
                }
                else {         //如果pos已被点开
                    ++uncover_num;   //则uncover_num加1
                }
            }
        }
    }
    var val=document.getElementById("div"+position).innerHTML;
    if(val==flag_num){                   //如果position的值等于周围旗子数，则展开周围未展开格子
        for(var k=0;k<cover.length;k++){
            Uncover(0,cover[k],size);
        }
    }
    else if(val-flag_num==cover.length){               //如果position的值-flag_num=未点开格子数，则给未点开的格子都标旗
        for(var k=0;k<cover.length;k++){
            Uncover(2,cover[k],size);
        }
    }
    else {            //若以上条件都不符合，则周围无格子能自动点开或标旗，周围格子闪动一次
        for(var k=0;k<cover.length;k++){
            document.getElementById("div"+cover[k]).setAttribute("style","box-shadow: -2px -2px 2px inset;");
            function cancel(){         //采用闭包
                var m=k;
                window.setTimeout(function(){
                    document.getElementById("div"+cover[m]).removeAttribute("style");
                },100);
            }
            cancel();
        }
    }
}