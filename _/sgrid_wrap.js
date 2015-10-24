define([],function(){window.TPL=window.TPL||{}; window.TPL["sgrid_wrap"]=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="sGrid">\r\n\t<div class="sGrid-head">\r\n\t\t\r\n\t</div>\r\n\t<div class="sGrid-body">\r\n\t\t\r\n\t</div>\r\n\t<div class="sGrid-foot">\r\n\t\t\r\n\t</div>\r\n</div>';
}
return __p;
 function _escape(string) {if (string == null) return ''; return ('' + string).replace(new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'), function(match) {return {'&': '&amp;','<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#x27;','/': '&#x2F;'}[match]; });};};})