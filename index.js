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

step1();
