
var csrfToken = ' ';
var sessionid = ' ';

function ErrorsHandler(response){
    if (!response.ok) {
        console.log('ERROR: ' + response)
        //throw Error(response.statusText)
        chrome.runtime.sendMessage({'action':'Dataposted', 'result':'failed'})
    }
    else{
        chrome.runtime.sendMessage({'action':'Dataposted', 'result':"success"})
    }
    return response
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    chrome.cookies.get({"url":"https://hololink.co/", "name":"csrftoken"}, function(cookie){
        csrfToken = cookie.value;
        chrome.cookies.get({"url":"https://hololink.co/", "name":"sessionid"}, function(cookie){
            sessionid = cookie.value
            if (request.query == "postData"){   
                var myHeaders = new Headers();
                myHeaders.append("X-CSRFToken", csrfToken);
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Cookie", `sessionid=${sessionid}; csrftoken=${csrfToken}`);
                myHeaders.append("X-Requested-With", "XMLHttpRequest");
                console.log(myHeaders)

                var raw = JSON.stringify({
                    "name": request.data_title,
                    "content": request.data,
                    "from_url": request.data_url,
                    "recommendation": request.recommendation
                });
    
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow',
                    credentials: 'include',
                    mode:'cors'
                };
    
                fetch(request.target_url, requestOptions)
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
                    
            }
        });
    });
});


/*
    由於 Google Chrome 會自動 overwrite referer 所以要特別用 webRequest
    api 來重新設置 referer。
    -> 之後要注意如何修改才能更保障安全性
*/

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
    var newRef = "https://hololink.co/api/articles";
    var gotRef = false;
    console.log('ohYA, inwebRequest')
    for(var n in details.requestHeaders){
        gotRef = details.requestHeaders[n].name.toLowerCase()=="referer";
        if(gotRef){
            details.requestHeaders[n].value = newRef;
            break;
            
        }
    }
    if(!gotRef){
        details.requestHeaders.push({name:"Referer",value:newRef});
    }
    return {requestHeaders:details.requestHeaders};},
    {urls:["https://hololink.co/*"]},
    [
        "requestHeaders",
        "blocking",
        "extraHeaders"
    ]
);


chrome.tabs.onUpdated.addListener(function(){
    chrome.cookies.get({"url":"https://hololink.co/", "name":"sessionid"}, function(cookie){
        if (cookie){
            chrome.browserAction.setPopup({"popup":"popup.html"})
            //window.location.href="popup.html";
            console.log('user already logged in');  
        }
        else{
            //window.location.href="popup_login.html";
            chrome.browserAction.setPopup({"popup":"popup_login.html"})
            console.log('user not log in'); 
        } 
    });
})


/*
chrome.tabs.onActivated.addListener(function(){
    console.log('popup open');
    chrome.cookies.get({"url":"https://hololink.co/", "name":"sessionid"}, function(cookie){
        if (cookie){
            //chrome.browserAction.setPopup({"popup":"popup.html"})
            window.location.href="popup.html";
            console.log('user already logged in');  
        }
        else{
            window.location.href="popup_login.html";
            //chrome.browserAction.setPopup({"popup":"popup_login.html"})
            console.log('user not log in'); 
        } 
    });
})
*/

/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action == "gotText"){
        var xhr = new XMLHttpRequest();
        var title =" ";
        var url = " ";

        xhr.open('POST', 'https://hololink.co/article/add/');
        xhr.setRequestHeader("Content-Type", "application/json");

        chrome.tabs.query({active:true, currentWindow:true},function(tab){ //之所以要放上 currentWindow 的原因在於如果不加這個指令，系統會以為你是指 popup，這樣會回傳 undefined
            var title = tab[0].title;
            var url = tab[0].url;
        });
        
        var form = new FormData();

        form.append("name", title);
        form.append("content", "Does this work?????????");
        form.append("url", url);

        xhr.send(form);

        console.log('oyes it works')
    }
})
*/