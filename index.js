//
// 自动化截取刷卡资料
//

'use strict';	// Whole-script strict mode applied.

const http = require('http');   // NOTE: import default module
const fs = require('fs');       // NOTE: import default module

//
// Step 1: Open login page to get cookie 'ASP.NET_SessionId' and hidden input '_ASPNetRecycleSession'.
//
var _ASPNET_SessionId;
var _ASPNetRecycleSession;

function step1() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===200) {
                let fo = fs.createWriteStream('tmp/step1.html');
                fo.write(html);
                fo.end();
                let cookie = response.headers['set-cookie'][0];
                let patc = new RegExp('ASP.NET_SessionId=(.*?);');
                let mc = patc.exec(cookie);
                if (mc) {
                    _ASPNET_SessionId = mc[1];
                    console.log(`cookie ASP.NET_SessionId: ${_ASPNET_SessionId}`);
                }
                let patm =  new RegExp('<input type="hidden" name="_ASPNetRecycleSession" id="_ASPNetRecycleSession" value="(.*?)" />');
                let mm = patm.exec(html);
                if (mm) {
                    _ASPNetRecycleSession = mm[1];
                    console.log(`_ASPNetRecycleSession: ${_ASPNetRecycleSession}`);
                }
                console.log('Step1 done.');
                step2();
            } else {
                let msg = `Step1 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let req = http.request("http://twhratsql.whq.wistron/OGWeb/LoginForm.aspx", callback);

    req.on('error', e => {
        let msg = `Step1 Problem: ${e.message}`;
        console.error(msg);
    });

    req.end();
}

//
// Step 2: POST data to login to get cookie 'OGWeb'.
//
const querystring = require('querystring'); // NOTE: explicitly imported
var OGWeb;

function step2() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===302) {
                let fo = fs.createWriteStream('tmp/step2.html');
                fo.write(html);
                fo.end();
                let cookie = response.headers['set-cookie'][0];
                let patc = new RegExp('OGWeb=(.*?);');
                let mc = patc.exec(cookie);
                if (mc) {
                    OGWeb = mc[1];
                    console.log(`cookie OGWeb: ${OGWeb}`);
                }
                console.log('Step2 done.');
                step3();
            } else {
                let msg = `Step2 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let postData = querystring.stringify({
        '__ctl07_Scroll': '0,0',
        '__VIEWSTATE': '/wEPDwULLTEyMTM0NTM5MDcPFCsAAmQUKwABZBYCAgMPFgIeBXN0eWxlBTFiZWhhdmlvcjp1cmwoL09HV2ViL3RxdWFya19jbGllbnQvZm9ybS9mb3JtLmh0Yyk7FhACCA8UKwAEZGRnaGQCCg8PFgIeDEVycm9yTWVzc2FnZQUZQWNjb3VudCBjYW4gbm90IGJlIGVtcHR5LmRkAgwPDxYCHwEFGlBhc3N3b3JkIGNhbiBub3QgYmUgZW1wdHkuZGQCDQ8PFgIeB1Zpc2libGVoZGQCDg8UKwAEZGRnaGQCEg8UKwADDxYCHgRUZXh0BSlXZWxjb21lIFRvIOe3r+WJteizh+mAmuiCoeS7veaciemZkOWFrOWPuGRkZ2QCFA8UKwADDxYCHwMFK0Jlc3QgUmVzb2x1dGlvbjoxMDI0IHggNzY4OyBJRSA2LjAgb3IgYWJvdmVkZGdkAhsPFCsAAmQoKWdTeXN0ZW0uRHJhd2luZy5Qb2ludCwgU3lzdGVtLkRyYXdpbmcsIFZlcnNpb249Mi4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iMDNmNWY3ZjExZDUwYTNhBDAsIDBkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYCBQVjdGwwNwUITG9naW5CdG6vo0TFNrmm9RKH7uSQ+NY2OXccyA==',
        '__VIEWSTATEGENERATOR': 'F163E3A2',
        '_PageInstance': '1',
        '__EVENTVALIDATION': '/wEWBAK20LBAAsiTss0OArOuiN0CArmtoJkDPmmwqug37xjPhGglEwK8JU9zleg=',
        'UserPassword': 'S0808001',
        'UserAccount': 'S0808001',
        'LoginBtn.x': '74',
        'LoginBtn.y': '10',
        '_ASPNetRecycleSession': _ASPNetRecycleSession
    });
    //console.log(postData);
    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/LoginForm.aspx",
        method: "POST",
        headers: {
            'Cookie': `ASP.NET_SessionId=`+_ASPNET_SessionId,   // NOTED.
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, callback);

    req.on('error', e => {
        let msg = `Step2 Problem: ${e.message}`;
        console.error(msg);
    });

    req.write(postData);    // NOTE:
    req.end();              // = req.end(postData)
}

//
// Step 3: Open EntryLogQueryForm.aspx page to get hidden input '_ASPNetRecycleSession', '__VIEWSTATE' and '__EVENTVALIDATION'.
//
var __VIEWSTATE = '';
var __EVENTVALIDATION = '';

function step3() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===200) {
                let fo = fs.createWriteStream('tmp/step3.html');
                fo.write(html);
                fo.end();
                let patm =  new RegExp('<input type="hidden" name="_ASPNetRecycleSession" id="_ASPNetRecycleSession" value="(.*?)" />');
                let mm = patm.exec(html);
                if (mm) {
                    _ASPNetRecycleSession = mm[1];
                    console.log(`_ASPNetRecycleSession: ${_ASPNetRecycleSession}`);
                }
                let patv =  new RegExp('<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="(.*?)"');
                let mv = patv.exec(html);
                if (mv) {
                    __VIEWSTATE = mv[1];
                    console.log(`__VIEWSTATE: ${__VIEWSTATE}`);
                }
                let pate =  new RegExp('<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="(.*?)"');
                let me = pate.exec(html);
                if (me) {
                    __EVENTVALIDATION = me[1];
                    console.log(`__EVENTVALIDATION: ${__EVENTVALIDATION}`);
                }
                console.log('Step3 done.');
                step4();
            } else {
                let msg = `Step3 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/OGWebReport/EntryLogQueryForm.aspx",
        //method: "GET",    // Default can be omitted.
        headers: {
            'Cookie': `ASP.NET_SessionId=${_ASPNET_SessionId}; OGWeb=${OGWeb}`  // important
        }
    }, callback);

    req.on('error', e => {
        let msg = `Step3 Problem: ${e.message}`;
        console.error(msg);
    });

    req.end();
}

//
// Step 4: POST data to inquire.
//
function step4() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===200) {
                let fo = fs.createWriteStream('tmp/step4.html');
                fo.write(html);
                fo.end();
                parseKQ(html);
                console.log('Step4 done.');
            } else {
                let msg = `Step4 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    // NOTE: 这些参数应该让使用者输入
    var BeginDate = '12/4/2020';
    var EndDate = '12/4/2020';
    var BeginTime = '0:00';
    var EndTime = '23:59';
    var employeeId = '8106062';

    let postData = querystring.stringify({
        'TQuarkScriptManager1': 'QueryResultUpdatePanel|QueryBtn',
        'TQuarkScriptManager1_HiddenField': ';;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:411fea1c:865923e8;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:91bd373d:d7d5263e:f8df1b50;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:e7c87f07:bbfda34c:30a78ec5;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:9b7907bc:9349f837:d4245214;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:e3d6b3ac;',
        '__ctl07_Scroll': '0,0',
        '__VIEWSTATEGENERATOR': 'A21EDEFC',
        'QueryBtn': 'Inquire',
        '_ASPNetRecycleSession': _ASPNetRecycleSession,
        '__VIEWSTATE': __VIEWSTATE,
        '_PageInstance': 4,
        '__EVENTVALIDATION': __EVENTVALIDATION,
        'AttNoNameCtrl1$InputTB': '上海欽江路',
        'BeginDateTB$Editor': BeginDate,
        'BeginDateTB$_TimeEdit': BeginTime,
        'EndDateTB$Editor': EndDate,
        'EndDateTB$_TimeEdit': EndTime,
        'EmpNoNameCtrl1$InputTB': employeeId
    });
    console.log(postData);

    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/OGWebReport/EntryLogQueryForm.aspx",
        method: "POST",
        headers: {
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; MAARJS)',	// mimic IE 11 // important
            'X-MicrosoftAjax': 'Delta=true',    // important
            'Cookie': `ASP.NET_SessionId=${_ASPNET_SessionId}; OGWeb=${OGWeb}`,  // important
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, callback);

    req.on('error', e => {
        let msg = `Step4 Problem: ${e.message}`;
        console.error(msg);
    });

    req.end(postData);
}

function parseKQ(html) {
    console.log(`/Department /Employee No.  /Employee Name  /Card Number    /Clock Time`);
    while (true) {
        let p =  new RegExp('<td>(.*?)</td><td>&nbsp;</td><td><.*?>(.*?)</a></td><td>(.*?)</td><td>(.*?)</td><td>(.*?)</td>',
            'g');   // NOTE: 'g' is important
        let m = p.exec(html);
        if (m) {
            console.log(`${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`);
            html = html.substr(p.lastIndex);
        } else {
			break;
		}
    }
}

step1();
