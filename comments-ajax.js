/**
 * WordPress jQuery-Ajax-Comments v1.3 by Willin Kan.
 * URI: http://kan.willin.org/?p=1271
 */
var i = 0, got = -1, len = document.getElementsByTagName('script').length;
while ( i <= len && got == -1){
	var js_url = document.getElementsByTagName('script')[i].src,
			got = js_url.indexOf('comments-ajax.js'); i++ ;
}
var edit_mode = '1', // 再編輯模式 ( '1'=開; '0'=不開 )
		ajax_php_url = js_url.replace('-ajax.js','-ajax.php'),
		wp_url = js_url.substr(0, js_url.indexOf('wp-content')),
		pic_sb = wp_url + 'wp-admin/images/wpspin_dark.gif', // 提交 icon
		pic_no = wp_url + 'wp-admin/images/no.png',      // 錯誤 icon
		pic_ys = wp_url + 'wp-admin/images/yes.png',     // 成功 icon
		txt1 = '<div id="loading"><img src="' + pic_sb + '" style="vertical-align:middle;" alt=""/> 正在提交, 请稍后...</div>',
		txt2 = '<div id="error">#</div>',
		txt3 = '"><img src="' + pic_ys + '" style="vertical-align:middle;" alt=""/> 提交成功',
		edt1 = ', 刷新页面之前可以<a rel="nofollow" class="comment-reply-link" href="#edit" onclick=\'return addComment.moveForm("',
		edt2 = ')\'>再编辑</a>',
		cancel_edit = '取消编辑',
		edit, num = 1, comm_array=[]; comm_array.push('');

jQuery(document).ready(function($) {
		$comments = $('#comments-title'); // 評論數的 ID
		$cancel = $('#cancel-comment-reply-link'); 
		cancel_text = $cancel.text();
		$submit = $('#commentform #submit');
		$submit.attr('disabled', false);
		$('#comment').after( txt1 + txt2 ); $('#loading').hide(); $('#error').hide();
		$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');

/** submit */
$('#commentform').submit(function() {
		$('#loading').slideDown();
		$submit.attr('disabled', true).fadeTo('slow', 0.5);
		if ( edit ) $('#comment').after('<input type="text" name="edit_id" id="edit_id" value="' + edit + '" style="display:none;" />');

/** Ajax */
	$.ajax( {
		url: ajax_php_url,
		data: $(this).serialize(),
		type: $(this).attr('method'),

		error: function(request) {
			$('#loading').slideUp();
			$('#error').slideDown().html('<img src="' + pic_no + '" style="vertical-align:middle;" alt=""/> ' + request.responseText);
			setTimeout(function() {$submit.attr('disabled', false).fadeTo('slow', 1); $('#error').slideUp();}, 3000);
			},

		success: function(data) {
			$('#loading').hide();
			comm_array.push($('#comment').val());
			$('textarea').each(function() {this.value = ''});
			var t = addComment, cancel = t.I('cancel-comment-reply-link'), temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId), post = t.I('comment_post_ID').value, parent = t.I('comment_parent').value;

// comments
		if ( ! edit && $comments.length ) {
			n = parseInt($comments.text().match(/\d+/));
			$comments.text($comments.text().replace( n, n + 1 ));
		}

// show comment
		new_htm = '" id="new_comm_' + num + '"></';
		new_htm = ( parent == '0' ) ? ('\n<ol style="clear:both;" class="comment_list' + new_htm + 'ol>') : ('\n<ul class="children' + new_htm + 'ul>');

		ok_htm = '\n<span id="success_' + num + txt3;
		if ( edit_mode == '1' ) {
			div_ = (document.body.innerHTML.indexOf('div-comment-') == -1) ? '' : ((document.body.innerHTML.indexOf('li-comment-') == -1) ? 'div-' : '');
			ok_htm = ok_htm.concat(edt1, div_, 'comment-', parent, '", "', parent, '", "respond", "', post, '", ', num, edt2);
		}
		ok_htm += '</span><span></span>\n';

		$('#respond').before(new_htm);
		$('#new_comm_' + num).hide().append(data);
		$('#new_comm_' + num + ' li').append(ok_htm);
		$('#new_comm_' + num).fadeIn(4000);

		$body.animate( { scrollTop: $('#new_comm_' + num).offset().top - 200}, 900);
		countdown(); num++ ; edit = ''; $('*').remove('#edit_id');
		cancel.style.display = 'none';
		cancel.onclick = null;
		t.I('comment_parent').value = '0';
		if ( temp && respond ) {
			temp.parentNode.insertBefore(respond, temp);
			temp.parentNode.removeChild(temp)
		}
		}
	}); // end Ajax
  return false;
}); // end submit

/** comment-reply.dev.js */
addComment = {
	moveForm : function(commId, parentId, respondId, postId, num) {
		reply(commId);
		var t = this, div, comm = t.I(commId), respond = t.I(respondId), cancel = t.I('cancel-comment-reply-link'), parent = t.I('comment_parent'), post = t.I('comment_post_ID');
		if ( edit ) exit_prev_edit();
		num ? (
			t.I('comment').value = comm_array[num],
			edit = t.I('new_comm_' + num).innerHTML.match(/(comment-)(\d+)/)[2],
			$new_sucs = $('#success_' + num ), $new_sucs.hide(),
			$new_comm = $('#new_comm_' + num ), $new_comm.hide(),
			$cancel.text(cancel_edit)
		) : $cancel.text(cancel_text);

		t.respondId = respondId;
		postId = postId || false;

		if ( !t.I('wp-temp-form-div') ) {
			div = document.createElement('div');
			div.id = 'wp-temp-form-div';
			div.style.display = 'none';
			respond.parentNode.insertBefore(div, respond)
		}

		!comm ? ( 
			temp = t.I('wp-temp-form-div'),
			t.I('comment_parent').value = '0',
			temp.parentNode.insertBefore(respond, temp),
			temp.parentNode.removeChild(temp)
		) : comm.parentNode.insertBefore(respond, comm.nextSibling);
		$body.animate( { scrollTop: $('#respond').offset().top - 180 }, 400);
		if ( post && postId ) post.value = postId;
		parent.value = parentId;
		cancel.style.display = '';

		cancel.onclick = function() {
			if ( edit ) exit_prev_edit();
			var t = addComment, temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId);

			t.I('comment_parent').value = '0';
			if ( temp && respond ) {
				temp.parentNode.insertBefore(respond, temp);
				temp.parentNode.removeChild(temp);
			}
			this.style.display = 'none';
			this.onclick = null;
			return false;
		};

		/*try { t.I('comment').focus(); }
		catch(e) {}*/
		$('#comment').focusEnd();

		return false;
	},

	I : function(e) {
		return document.getElementById(e);
	}
}; // end addComment

function exit_prev_edit() {
		$new_comm.show(); $new_sucs.show();
		$('textarea').each(function() {this.value = ''});
		edit = '';
}

var wait = 15, submit_val = $submit.val();
function countdown() {
	if ( wait > 0 ) {
		$submit.val(wait); wait--; setTimeout(countdown, 1000);
	} else {
		$submit.val(submit_val).attr('disabled', false).fadeTo('slow', 1);
		wait = 15;
  }
}


function reply(comid){
	var cid=comid.replace("comment-","");
	var author = $('#reviewer-'+cid).text();
	var insertStr = '<a href="#' + comid + '">@' + author.replace(/\t|\n/g, "") + '</a>';
	$("#comment").val(insertStr);
}
$.fn.setCursorPosition = function(position){
    if(this.lengh == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function(selectionStart, selectionEnd) {
    if(this.lengh == 0) return this;
    input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}

$.fn.focusEnd = function(){
    this.setCursorPosition(this.val().length);
}



});// end jQ

/* 存档页面 jQ伸缩 */
 $('.archives-yearmonth').css({cursor:"s-resize"});
 $('#archives ul.archives-monthlisting:first').slideDown();
 $('#archives h2.archives-yearmonth').click(function(){$(this).next().slideToggle('fast');return false;});
 //以下下是全局的操作
 $('#expand_collapse').toggle(
 function(){
 $('#archives ul.archives-monthlisting').slideDown('fast');
 },
 function(){
 $('#archives ul.archives-monthlisting').slideUp('fast');
 });

/*
function isie6() {if ($.browser.msie) 
  {if ($.browser.version == "6.0") 
  return true;
  }
  return false;
  } 
if (!isie6()){
	if($('.widget_tag_cloud').length>0){
 //侧栏随动
var rollStart = $('.widget_tag_cloud'), //滚动到此区块的时候开始随动
	rollSet = $('.widget_categories,.widget_tag_cloud'); //添加rollStart之前的随动区块
rollStart.before('<div class="da_rollbox" style="position:fixed;width:inherit;background:#F3F8D1;"></div>');
var offset = rollStart.offset(),objWindow = $(window),rollBox = rollStart.prev();
objWindow.scroll(function() {
	if (objWindow.scrollTop() > offset.top){
		if(rollBox.html(null)){
			rollSet.clone().prependTo('.da_rollbox');
		}
		rollBox.show().stop().animate({top:0,paddingTop:1},400);
	} else {
		rollBox.hide().stop().animate({top:0},400);
	}
});
}
}*/
$('#shang').click(function(){$('html,body').animate({scrollTop: '0px'}, 800);});
$('#comt').click(function(){$('html,body').animate({scrollTop:$('#comments').offset().top}, 800);});
$('#xia').click(function(){$('html,body').animate({scrollTop:$('#footer').offset().top}, 800);});
$('.fn a').attr({ target: "_blank"});//新窗口打开评论者连接
$('#menu-item-275 a').attr({ target: "_blank"});

$(function(){
		$(".runcode").attr("contentEditable","true");
		$(".runit").click(function(){
			var code=$(this).parents(".code_contain").find(".runcode").text();
			runCode (code);
		});
		$(".saveit").click(function(){
			var code=$(this).parents(".code_contain").find(".runcode").text();
			saveCode (code);
		});
		
		copyThis();
})

function runCode(code) {
	var winname = window.open('', "_blank", '');
	winname.document.open('text/html', 'replace');
	winname.opener = null;
	winname.document.write(code);
	winname.document.close();
}
function saveCode(code) {
	var winname = window.open('', '_blank', 'top=10000');
	winname.document.open('text/html', 'replace');
	winname.document.write(code);
	winname.document.execCommand('saveas','','code.htm');
	winname.close();
}
var clip = null;
function copyThis() {
			clip = new ZeroClipboard.Client();
			clip.setHandCursor( true );
			clip.addEventListener( 'onComplete', my_complete );
			function my_complete(){alert("代码已经成功复制到剪切板！");}
			$('.copyit').mouseover( function() {
				var code=$(this).parents(".code_contain").find(".runcode").text();
				clip.setText(code);
				if (clip.div) {
					clip.receiveEvent('mouseout', null);
					clip.reposition(this);
				}
				else clip.glue(this);
				clip.receiveEvent('mouseover', null);
			} );
}
