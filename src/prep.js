
var shadow
var lock_sidebar = false
var highlight_and_annotation 

var hololink_toolbar_container = document.createElement('div');
hololink_toolbar_container.setAttribute('class', 'hololink-toolbar-container');
document.body.appendChild(hololink_toolbar_container);

var hololink_toolbar_inner = document.createElement('div');
hololink_toolbar_inner.setAttribute('class', 'hololink-toolbar-inner');

var highlight_button = document.createElement('button');
highlight_button.setAttribute('class', 'hololink-toolbar-button');
highlight_button.setAttribute('id', 'hololink_toolbar_highlight');
highlight_button.setAttribute('data-toggle', 'tooltip');
highlight_button.setAttribute('data-placement', 'bottom');
highlight_button.setAttribute('title', 'Highlight');
var highlighte_img = document.createElement('img');
highlight_img_path = chrome.runtime.getURL("img/highlighter.svg");
highlighte_img.setAttribute('src', highlight_img_path);
highlighte_img.setAttribute('width', 20);
highlighte_img.setAttribute('height', 20);
highlighte_img.setAttribute('class', 'hololink-toolbar-button-img');
highlight_button.appendChild(highlighte_img);

var annotate_button = document.createElement('button');
annotate_button.setAttribute('class', 'hololink-toolbar-button');
annotate_button.setAttribute('id', 'hololink_toolbar_annotate');
annotate_button.setAttribute('data-toggle', 'tooltip');
annotate_button.setAttribute('data-placement', 'bottom');
annotate_button.setAttribute('title', 'Annotate');
var annotate_img = document.createElement('img');
highlight_img_path = chrome.runtime.getURL("img/chat.svg");
annotate_img.setAttribute('src', highlight_img_path);
annotate_img.setAttribute('width', 20);
annotate_img.setAttribute('height', 20);
annotate_img.setAttribute('class', 'hololink-toolbar-button-img');
annotate_button.appendChild(annotate_img);

hololink_toolbar_inner.appendChild(highlight_button);
hololink_toolbar_inner.appendChild(annotate_button);


console.log('selection sanity check')

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
    var selection = document.getSelection && document.getSelection();
    var position = calaculate_tooltip_position()
    console.log(e)
    if (selection.toString().length > 0 && !$('.hololink-toolbar-inner').length) {
        render_tooltip(position.x, position.y);
        hololink_toolbar_container.appendChild(hololink_toolbar_inner);
        console.log('inside')
        $('#hololink_toolbar_highlight').on('click', function(){
            render_highlight();
        });

        $('#hololink_toolbar_annotate').on('click', function(){
            render_annotation();
        });
    }
    $('.hololink-toolbar-button').tooltip({
        template: '<div class="hololink-toolbar-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger : 'hover',
        html: true,
    })
}, false);

// Close the bubble when we click on the screen.
$(window).on('mousedown', function(e){
    // check if click event occured inside the hololink-toolbar-container
    target_array = Array.from(e.target.classList)
    const check_array_exist_target_class = target_array.some( r => ['hololink-toolbar-button-img', 'hololink-toolbar-button', 'hololink-toolbar-inner'].indexOf(r) >= 0 )

    if ($('.hololink-toolbar-inner').length){
        if (!check_array_exist_target_class){
            $('.hololink-toolbar-container').find('.hololink-toolbar-inner').remove();
        }
    }
});

function render_annotation(){

};

function render_highlight(){
    var selection = document.getSelection && document.getSelection();
    console.log('sss',selection.getRangeAt(0))
};

// Move that bubble to the appropriate location.
function render_tooltip(x, y) {
    hololink_toolbar_inner.style.left = x + 'px';
    hololink_toolbar_inner.style.top = y + 'px';
}

function calaculate_tooltip_position(){
    var selection = document.getSelection && document.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const boundingRect = range.getBoundingClientRect();
        const x = boundingRect.left + boundingRect.width / 2 - 50;
        const y = window.pageYOffset + boundingRect.top + boundingRect.height + 10;
        return {x:x, y:y} 
    }
};

//'open' mode to access shadow dom elements from outisde the shadow root.
const hololink_sidebar_container = document.createElement('div');
hololink_sidebar_container.setAttribute('class', 'hololink-sidebar-container')
document.body.appendChild(hololink_sidebar_container);

const shadowRoot = hololink_sidebar_container.attachShadow({mode: 'open'});
//const hololink_sidebar_inner = document.createElement('div');
//hololink_sidebar_inner.setAttribute('class', 'hololink-sidebar-inner')
//shadowRoot.appendChild(hololink_sidebar_inner)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action == 'open_sidebar'){
        console.log('receive msg')
        $.get(chrome.extension.getURL("hololink-sidebar.html"), function (data) {
            //$(data).appendTo($('.hololink-sidebar-inner'));
            shadow = $('.hololink-sidebar-container')[0].shadowRoot

            jquery_path = chrome.extension.getURL("src/jquery-3.5.1.min.js")

            shadow.innerHTML = `<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" 
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
            <script src=${jquery_path}></script>
            <div class="hololink-sidebar-inner"></div>`

            var inner = $(shadow).find('.hololink-sidebar-inner');
            inner.html(data);

            x_img_path = chrome.extension.getURL("img/x.svg")

            var x_img = $(shadow).find('.close-hololink-sidebar-img');
            x_img.attr('width', 20)
            x_img.attr('height', 20)
            x_img.attr('src', `${x_img_path}`)

            $(shadow).find('#close_hololink_sidebar').on('click', function(){
                $(shadow).find('.hololink-sidebar').remove();
            });


            close_sidebar_if_user_click_outside();

        });
    }
});


// callback for ensure_content_script_is_runnung
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.ping) { 
        console.log('ensured')
        sendResponse({pong: true}); 
        return true; 
    }
});

function close_sidebar_if_user_click_outside(){
    // Close sidebar if user's click event triggered outside the sidebar.

    $(window).on('click', function(e){
        if(!$(e.target).is('.hololink-sidebar-container')){
            //console.log('uee')
            if (lock_sidebar == false){
                $(shadow).find('.hololink-sidebar').remove();
            }
        }
    });
}