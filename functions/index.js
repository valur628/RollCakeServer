const firebase = require("firebase/app");
const firestoreService = require('firestore-export-import');
const firebaseAdmin = require('firebase-admin');
const firebaseConfig = require('./config.js');
const serviceAccount = require('./serviceAccount.json');
const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const puppeteer = require('puppeteer');
const { mainModule } = require('process');
const app = express();
//import dbFBI from './firebaseInit.js';


let S_Split = [
	['<span class="title">', '</span>'],
	['DONT', ''],
	['DONT', ''],
	['DONT', ''],
	['<strike>₩ ', ' </strike>'],
	['</span><br>₩ ', ' </div>'],
	['DONT', ''],
	['store.steampowered.com/', '/?'],
	['DONT', ''],
	['img src="https://cdn.cloudflare.steamstatic.com/steam/', '/capsule'],
	['DONT', '']
]
let HB_Split = [
	['"human_name":"', '"'],
	['DONT', ''],
	['DONT', ''],
	['"full_price":{"currency":"', '"'],
	['"full_price":{"currency":"USD","amount":', '}'],
	['"current_price":{"currency":"USD","amount":', '}'],
	['DONT', ''],
	['"human_url":"', '"'],
	['DONT', ''],
	['"featured_image_recommendation":"https://hb.imgix.net/', '"'],
	['"large_capsule":"https://hb.imgix.net/', '"']
]
let GOG_Split = [
	['"title":"', '",'],
	['DONT', ''],
	['"developer":"', '","'],
	['DONT', ''],
	['"baseAmount":"', '"'],
	['"finalAmount":"', '"'],
	['DONT', ''],
	['"url":"\\/game\\/', '",'],
	['DONT', ''],
	['"image":"\\/\\/', '"'],
	['"image":"\\/\\/', '"']
]

let randTimeDefault = 5000;
let randTimeAdd = 10000;

let html;
let nowLineCount = 0;
let nowTempCount = 1; //추가 SW 개수
let swS_lineTotal = 0;
let swS_sublineTotal = 0;
let swHB_lineTotal = 0;
let swHB_sublineTotal = 0;
let S_lineTotal = 0;
let S_sublineTotal = 0;
let HB_lineTotal = 0;
let HB_sublineTotal = 0;
let GOG_lineTotal = 0;
let GOG_sublineTotal = 0;
const steamRepeat = 50; //25가 기본 단위, 페이지당 개수
const humblebundleRepeat = 20;
const gogRepeat = 48;
const hostPort = 8080;

firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(serviceAccount)
});
const dbFBI = firebaseAdmin.firestore();

app.use(morgan('combined'));
app.listen(hostPort, () => {
	console.log('호스트 포트: ' + hostPort);
	console.log('웹 연결...');
});

function jsonSplit(splitValue, lines, SplitNum, DB_Split, lineCount) {
	try {
	return((splitValue[lines].split(DB_Split[SplitNum][0])[1].toString()).split(DB_Split[SplitNum][1])[0].toString());
	} catch(error) {
	if(error != "TypeError: Cannot read property 'split' of undefined")
		//console.log('jsonSplit 에러: ' + lineCount + ' = ' + error);
	return "ERROR";
	}
}

function isEmpty(emptyNum) {
	if (typeof emptyNum == "undefined" || emptyNum == null || emptyNum == "") {
		return true;
	} else {
		return false;
	}
}
//https://www.epicgames.com/graphql?operationName=searchStoreQuery&variables=%7B%22allowCountries%22:%22KR%22,%22category%22:%22games%2Fedition%2Fbase%7Csoftware%2Fedition%2Fbase%7Ceditors%7Cbundles%2Fgames%22,%22count%22:40,%22country%22:%22KR%22,%22effectiveDate%22:%22[,2021-10-11T14:59:59.999Z]%22,%22keywords%22:%22%22,%22locale%22:%22ko%22,%22onSale%22:true,%22sortBy%22:%22currentPrice%22,%22sortDir%22:%22ASC%22,%22start%22:0,%22tag%22:%22%22,%22withPrice%22:true%7D&extensions=%7B%22persistedQuery%22:%7B%22version%22:1,%22sha256Hash%22:%22f45c217481a66dd17324fbb288509bac7a2d81762e72518cb9d448a0aec43350%22%7D%7D

//https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=_ASC&snr=1_7_7_230_7&category1=994%2C996&infinite=1
async function sw_steamWeb(pageCount) {
	let splitValue = ["abcdefgh"];
	const swS_browser = await puppeteer.launch({
		headless: true
	});
	const swS_page = await swS_browser.newPage();
	await swS_page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
	await swS_page.goto('https://store.steampowered.com/search/results/?query&start=' + pageCount * steamRepeat + '&count=' + steamRepeat + '&dynamic_data=&sort_by=_ASC&snr=1_7_7_230_7&category1=994%2C996&infinite=1', {
		waitUntil: 'networkidle0'
	});
	html = await swS_page.content();
	await swS_page.waitForTimeout(randTimeDefault + (Math.floor(Math.random() * randTimeAdd)));
	html = html.replace(/(?:\\[rnt]|[\r\n\t])/g, "").replace(/\s\s+/g, ' ');
	html = html.replace(/&lt;\\/g, "<").replace(/&lt;/g, "<").replace(/&gt;\\/g, ">").replace(/&gt;/g, ">");
	html = html.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
	html = html.replace(/\\\//g, "/").replace(/\\\"/g, '"').replace(/ ₩/g, "₩");
	splitValue = html.split('<a href="');
	await swS_page.close();
	await swS_browser.close();
	return splitValue;
}

function sw_steamDB(splitValue, lines) {
	let FB_object = {
		DB_SoftIndex: 0,
		DB_SoftID: "Non-Platform_Non-ID",
		DB_SoftName: "Non-SoftName",
		DB_DevName: "Non-DevName",
		DB_UpdateTime: new Date(),
		DB_Currency: "Non-Currency",
		DB_RegCost: 0,
		DB_DisCost: -1,
		DB_DisRate: 0,
		DB_ProductAddress: "Non-Address",
		DB_Platform: "Non-Platform",
		DB_BigPicture: "Non-BigPicture",
		DB_SmallPicture: "Non-SmallPicture"
	}
	try {
		priceTemp = jsonSplit(splitValue, lines, 4, S_Split, nowLineCount);
		FB_object.DB_RegCost = parseInt(100 * parseFloat(priceTemp.replace(/₩/g, "").replace(/ /g, "").replace(/,/g, "")));
	} catch(error) {}
	try {
		priceTemp = jsonSplit(splitValue, lines, 5, S_Split, nowLineCount);
		FB_object.DB_DisCost = parseInt(100 * parseFloat(priceTemp.replace(/₩/g, "").replace(/ /g, "").replace(/,/g, "")));
	} catch(error) {
		swS_sublineTotal++;
		return "0";
	}

	if(isEmpty(FB_object.DB_RegCost) == true | isEmpty(FB_object.DB_DisCost) == true) {
		swS_sublineTotal++;
		return "0";//아니면 0
	}
	nameTemp = jsonSplit(splitValue, lines, 0, S_Split, nowLineCount);
	nameTemp = nameTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	nameTemp = nameTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "");
	nameTemp = nameTemp.replace(/\\u/g, "").replace(/\\u00a0/g, " ");
	FB_object.DB_SoftName = nameTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	if(FB_object.DB_SoftName == "" | FB_object.DB_SoftName == "ERROR") {
		swS_sublineTotal++;
		return "0";//아니면 0
	}
	FB_object.DB_DevName = " ";
	FB_object.DB_Currency = "KRW";
	FB_object.DB_DisRate = !FB_object.DB_RegCost && !FB_object.DB_DisCost ? 0 : parseInt(100 * parseFloat(100 - (Math.round(((parseInt(FB_object.DB_DisCost) / parseInt(FB_object.DB_RegCost)) * 100) * 10) / 10)));
	if(FB_object.DB_DisRate == 0 | isEmpty(FB_object.DB_DisRate) == true) {
		swS_sublineTotal++;
		return "0";//아니면 0
	}
	FB_object.DB_ProductAddress = "https://store.steampowered.com/" + jsonSplit(splitValue, lines, 7, S_Split, nowLineCount);
	FB_object.DB_Platform = "Steam";
	appidTemp = jsonSplit(splitValue, lines, 9, S_Split, nowLineCount);
	pictureTemp = 'https://cdn.cloudflare.steamstatic.com/steam/' + appidTemp + '/capsule_231x87.jpg';
	FB_object.DB_SmallPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	pictureTemp = 'https://cdn.cloudflare.steamstatic.com/steam/' + appidTemp + '/header.jpg';
	FB_object.DB_BigPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	appidArray = appidTemp.split('/');
	FB_object.DB_SoftID = "steam/" + appidArray[0] + "/" + appidArray[1];
	//서칭

	FB_object.DB_SoftIndex = nowLineCount;
	return JSON.stringify(FB_object, null, 5);
}

//https://www.humblebundle.com/store/api/search?sort=bestselling&filter=all&genre=software&page=1&request=1
async function sw_humblebundleWeb(pageCount) {
	let splitValue = ["abcdefgh"];
	const swHB_browser = await puppeteer.launch({
		headless: true
	});
	const swHB_page = await swHB_browser.newPage();
	await swHB_page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
	await swHB_page.goto('https://www.humblebundle.com/store/api/search?sort=bestselling&filter=all&genre=software&page=' + pageCount + '&request=1', {
		waitUntil: 'networkidle0'
	});
	html = await swHB_page.content();
	await swHB_page.waitForTimeout(randTimeDefault + (Math.floor(Math.random() * randTimeAdd)));
	splitValue = html.split('standard_carousel_image":"');
	await swHB_page.close();
	await swHB_browser.close();
	return splitValue;
}

function sw_humblebundleDB(splitValue, lines) {
	let FB_object = {
		DB_SoftIndex: 0,
		DB_SoftID: "Non-Platform_Non-ID",
		DB_SoftName: "Non-SoftName",
		DB_DevName: "Non-DevName",
		DB_UpdateTime: new Date(),
		DB_Currency: "Non-Currency",
		DB_RegCost: 0,
		DB_DisCost: -1,
		DB_DisRate: 0,
		DB_ProductAddress: "Non-Address",
		DB_Platform: "Non-Platform",
		DB_BigPicture: "Non-BigPicture",
		DB_SmallPicture: "Non-SmallPicture"
	}
	FB_object.DB_Currency = jsonSplit(splitValue, lines, 3, HB_Split, nowLineCount);
	FB_object.DB_RegCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 4, HB_Split, nowLineCount)));
	FB_object.DB_DisCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 5, HB_Split, nowLineCount)));
	if((FB_object.DB_DisCost == FB_object.DB_RegCost) && (FB_object.DB_RegCost != 0)) {
		FB_object.DB_DisCost = -1;
		swHB_sublineTotal++;
		return "0";
	}
	if(FB_object.DB_Currency == "ERROR") {
		swHB_sublineTotal++;
		return "0";
	}
	FB_object.DB_SoftIndex = nowLineCount;
	nameTemp = jsonSplit(splitValue, lines, 0, HB_Split, nowLineCount);
	nameTemp = nameTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	nameTemp = nameTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "").replace(/\\u00a0/g, " ");
	nameTemp = nameTemp.replace(/\\u/g, "");
	FB_object.DB_SoftName = nameTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	if(FB_object.DB_SoftName == "" | FB_object.DB_SoftName == "ERROR") {
		swHB_sublineTotal++;
		return "0";
	}
	FB_object.DB_DevName = " ";
	FB_object.DB_DisRate = parseInt(100 * parseFloat(100 - (Math.round(((parseInt(FB_object.DB_DisCost) / parseInt(FB_object.DB_RegCost)) * 100) * 10) / 10)));
	appidArray = jsonSplit(splitValue, lines, 7, HB_Split, nowLineCount);
	FB_object.DB_SoftID = "humblebundle/apps/" + appidArray;
	FB_object.DB_ProductAddress = "https://www.humblebundle.com/store/" + appidArray;
	FB_object.DB_Platform = "HumbleBundle";
	pictureTemp = 'https://hb.imgix.net/' + jsonSplit(splitValue, lines, 9, HB_Split, nowLineCount) + '.jpg';
	FB_object.DB_SmallPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	pictureTemp = 'https://hb.imgix.net/' + jsonSplit(splitValue, lines, 10, HB_Split, nowLineCount) + '.jpg';
	FB_object.DB_BigPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	return JSON.stringify(FB_object, null, 5);
}

//https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=Reviews_DESC&specials=1&filter=topsellers&infinite=1
async function steamWeb(pageCount) {
	let splitValue = ["abcdefgh"];
	const S_browser = await puppeteer.launch({
		headless: true
	});
	const S_page = await S_browser.newPage();
	await S_page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
	await S_page.goto('https://store.steampowered.com/search/results/?query&start=' + pageCount * steamRepeat + '&count=' + steamRepeat + '&dynamic_data=&sort_by=Reviews_DESC&specials=1&filter=TopSellers&infinite=1', {
		waitUntil: 'networkidle0'
	});
	html = await S_page.content();
	await S_page.waitForTimeout(randTimeDefault + (Math.floor(Math.random() * randTimeAdd)));
	html = html.replace(/(?:\\[rnt]|[\r\n\t])/g, "").replace(/\s\s+/g, ' ');
	html = html.replace(/&lt;\\/g, "<").replace(/&lt;/g, "<").replace(/&gt;\\/g, ">").replace(/&gt;/g, ">");
	html = html.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
	html = html.replace(/\\\//g, "/").replace(/\\\"/g, '"').replace(/ ₩/g, "₩");0
	splitValue = html.split('<a href="');
	await S_page.close();
	await S_browser.close();
	return splitValue;
}

function steamDB(splitValue, lines) {
	let FB_object = {
		DB_SoftIndex: 0,
		DB_SoftID: "Non-Platform_Non-ID",
		DB_SoftName: "Non-SoftName",
		DB_DevName: "Non-DevName",
		DB_UpdateTime: new Date(),
		DB_Currency: "Non-Currency",
		DB_RegCost: 0,
		DB_DisCost: -1,
		DB_DisRate: 0,
		DB_ProductAddress: "Non-Address",
		DB_Platform: "Non-Platform",
		DB_BigPicture: "Non-BigPicture",
		DB_SmallPicture: "Non-SmallPicture"
	}
	try {
		priceTemp = jsonSplit(splitValue, lines, 4, S_Split, nowLineCount);
		FB_object.DB_RegCost = parseInt(100 * parseFloat(priceTemp.replace(/₩/g, "").replace(/ /g, "").replace(/,/g, "")));
	} catch(error) {}
	try {
		priceTemp = jsonSplit(splitValue, lines, 5, S_Split, nowLineCount);
		FB_object.DB_DisCost = parseInt(100 * parseFloat(priceTemp.replace(/₩/g, "").replace(/ /g, "").replace(/,/g, "")));
	} catch(error) {
		S_sublineTotal++;
		return "0";
	}

	if(isEmpty(FB_object.DB_RegCost) == true | isEmpty(FB_object.DB_DisCost) == true) {
		S_sublineTotal++;
		return "0";//아니면 0
	}
	nameTemp = jsonSplit(splitValue, lines, 0, S_Split, nowLineCount);
	nameTemp = nameTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	nameTemp = nameTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "");
	nameTemp = nameTemp.replace(/\\u/g, "").replace(/\\u00a0/g, " ");
	FB_object.DB_SoftName = nameTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	if(FB_object.DB_SoftName == "" | FB_object.DB_SoftName == "ERROR") {
		S_sublineTotal++;
		return "0";//아니면 0
	}
	FB_object.DB_DevName = " ";
	FB_object.DB_Currency = "KRW";
	FB_object.DB_DisRate = !FB_object.DB_RegCost && !FB_object.DB_DisCost ? 0 : parseInt(100 * parseFloat(100 - (Math.round(((parseInt(FB_object.DB_DisCost) / parseInt(FB_object.DB_RegCost)) * 100) * 10) / 10)));
	if(FB_object.DB_DisRate == 0 | isEmpty(FB_object.DB_DisRate) == true) {
		S_sublineTotal++;
		return "0";//아니면 0
	}
	FB_object.DB_ProductAddress = "https://store.steampowered.com/" + jsonSplit(splitValue, lines, 7, S_Split, nowLineCount);
	FB_object.DB_Platform = "Steam";
	appidTemp = jsonSplit(splitValue, lines, 9, S_Split, nowLineCount);
	pictureTemp = 'https://cdn.cloudflare.steamstatic.com/steam/' + appidTemp + '/capsule_231x87.jpg';
	FB_object.DB_SmallPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	pictureTemp = 'https://cdn.cloudflare.steamstatic.com/steam/' + appidTemp + '/header.jpg';
	FB_object.DB_BigPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	appidArray = appidTemp.split('/');
	FB_object.DB_SoftID = "steam/" + appidArray[0] + "/" + appidArray[1];
	//서칭

	FB_object.DB_SoftIndex = nowLineCount;
	return JSON.stringify(FB_object, null, 5);
}

//https://www.humblebundle.com/store/api/search?sort=bestselling&filter=onsale&page=1&request=1
async function humblebundleWeb(pageCount) {
	let splitValue = ["abcdefgh"];
	const HB_browser = await puppeteer.launch({
		headless: true
	});
	const HB_page = await HB_browser.newPage();
	await HB_page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
	await HB_page.goto('https://www.humblebundle.com/store/api/search?sort=bestselling&filter=onsale&page=' + pageCount + '&request=1', {
		waitUntil: 'networkidle0'
	});
	html = await HB_page.content();
	await HB_page.waitForTimeout(randTimeDefault + (Math.floor(Math.random() * randTimeAdd)));
	splitValue = html.split('standard_carousel_image":"');
	await HB_page.close();
	await HB_browser.close();
	return splitValue;
}

function humblebundleDB(splitValue, lines) {
	let FB_object = {
		DB_SoftIndex: 0,
		DB_SoftID: "Non-Platform_Non-ID",
		DB_SoftName: "Non-SoftName",
		DB_DevName: "Non-DevName",
		DB_UpdateTime: new Date(),
		DB_Currency: "Non-Currency",
		DB_RegCost: 0,
		DB_DisCost: -1,
		DB_DisRate: 0,
		DB_ProductAddress: "Non-Address",
		DB_Platform: "Non-Platform",
		DB_BigPicture: "Non-BigPicture",
		DB_SmallPicture: "Non-SmallPicture"
	}
	FB_object.DB_Currency = jsonSplit(splitValue, lines, 3, HB_Split, nowLineCount);
	FB_object.DB_RegCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 4, HB_Split, nowLineCount)));
	FB_object.DB_DisCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 5, HB_Split, nowLineCount)));
	if((FB_object.DB_DisCost == FB_object.DB_RegCost) && (FB_object.DB_RegCost != 0)) {
		FB_object.DB_DisCost = -1;
		HB_sublineTotal++;
		return "0";
	}
	if(FB_object.DB_Currency == "ERROR") {
		HB_sublineTotal++;
		return "0";
	}
	FB_object.DB_SoftIndex = nowLineCount;
	nameTemp = jsonSplit(splitValue, lines, 0, HB_Split, nowLineCount);
	nameTemp = nameTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	nameTemp = nameTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "").replace(/\\u00a0/g, " ");
	nameTemp = nameTemp.replace(/\\u/g, "");
	FB_object.DB_SoftName = nameTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	if(FB_object.DB_SoftName == "" | FB_object.DB_SoftName == "ERROR") {
		HB_sublineTotal++;
		return "0";
	}
	FB_object.DB_DevName = " ";
	FB_object.DB_DisRate = parseInt(100 * parseFloat(100 - (Math.round(((parseInt(FB_object.DB_DisCost) / parseInt(FB_object.DB_RegCost)) * 100) * 10) / 10)));
	appidArray = jsonSplit(splitValue, lines, 7, HB_Split, nowLineCount);
	FB_object.DB_SoftID = "humblebundle/apps/" + appidArray;
	FB_object.DB_ProductAddress = "https://www.humblebundle.com/store/" + appidArray;
	FB_object.DB_Platform = "HumbleBundle";
	pictureTemp = 'https://hb.imgix.net/' + jsonSplit(splitValue, lines, 9, HB_Split, nowLineCount) + '.jpg';
	FB_object.DB_SmallPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	pictureTemp = 'https://hb.imgix.net/' + jsonSplit(splitValue, lines, 10, HB_Split, nowLineCount) + '.jpg';
	FB_object.DB_BigPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp : pictureTemp.replace(/&amp;/g, "&");
	return JSON.stringify(FB_object, null, 5);
}

//https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&price=discounted&sort=popularity
async function GOGWeb(pageCount) {
	let splitValue = ["abcdefgh"];
	const GOG_browser = await puppeteer.launch({
		headless: true
	});
	const GOG_page = await GOG_browser.newPage();
	await GOG_page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
	await GOG_page.goto('https://www.gog.com/games/ajax/filtered?mediaType=game&page=' + pageCount + '&price=discounted&sort=popularity', {
		waitUntil: 'networkidle0'
	});
	html = await GOG_page.content();
	await GOG_page.waitForTimeout(randTimeDefault + (Math.floor(Math.random() * randTimeAdd)));
	splitValue = html.split('"customAttributes":[],');
	await GOG_page.close();
	await GOG_browser.close();
	return splitValue;
}

function GOGDB(splitValue, lines) {
	let FB_object = {
		DB_SoftIndex: 0,
		DB_SoftID: "Non-Platform_Non-ID",
		DB_SoftName: "Non-SoftName",
		DB_DevName: "Non-DevName",
		DB_UpdateTime: new Date(),
		DB_Currency: "Non-Currency",
		DB_RegCost: 0,
		DB_DisCost: -1,
		DB_DisRate: 0,
		DB_ProductAddress: "Non-Address",
		DB_Platform: "Non-Platform",
		DB_BigPicture: "Non-BigPicture",
		DB_SmallPicture: "Non-SmallPicture"
	}
	FB_object.DB_Currency = "USD";
	FB_object.DB_RegCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 4, GOG_Split, nowLineCount)));
	FB_object.DB_DisCost = parseInt(100 * parseFloat(jsonSplit(splitValue, lines, 5, GOG_Split, nowLineCount)));
	if((FB_object.DB_DisCost == FB_object.DB_RegCost) && (FB_object.DB_RegCost != 0)) {
		FB_object.DB_DisCost = -1;
		GOG_sublineTotal++;
		return "0";
	}
	if(FB_object.DB_Currency == "ERROR") {
		GOG_sublineTotal++;
		return "0";
	}
	FB_object.DB_SoftIndex = nowLineCount;
	nameTemp = jsonSplit(splitValue, lines, 0, GOG_Split, nowLineCount);
	nameTemp = nameTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	nameTemp = nameTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "").replace(/\\u00a0/g, " ");
	nameTemp = nameTemp.replace(/\\u/g, "");
	nameTemp = nameTemp.replace(/®/g, "00ae").replace(/’s/g, '2019s').replace(/™/g, "2122").replace(/'/g, "0027");
	FB_object.DB_SoftName = nameTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	if(FB_object.DB_SoftName == "" | FB_object.DB_SoftName == "ERROR") {
		GOG_sublineTotal++;
		return "0";
	}
	devTemp = jsonSplit(splitValue, lines, 2, GOG_Split, nowLineCount);
	devTemp = devTemp.replace(/&amp;/g, "&").replace(/&2122/g, "");
	devTemp = devTemp.replace(/^[\s\u00a0\u3000]+|[\s\u00a0\u3000]+$/g, "").replace(/\\u00a0/g, " ");
	devTemp = devTemp.replace(/\\u/g, "");
	FB_object.DB_DevName = devTemp.replace(/00ae/g, "\u00AE").replace(/2019s/g, '\u2019s').replace(/2122/g, "\u2122").replace(/0027/g, "\u0027").replace(/0026/g, "\u0026").replace(/00db/g, "\u00db").replace(/00f6/g, "\u00f6").replace(/0022/g, "\u0022").replace(/00fb/g, "\u00fb").replace(/00fc/g, "\u00fc");
	FB_object.DB_DisRate = parseInt(100 * parseFloat(100 - (Math.round(((parseInt(FB_object.DB_DisCost) / parseInt(FB_object.DB_RegCost)) * 100) * 10) / 10)));
	appidArray = jsonSplit(splitValue, lines, 7, GOG_Split, nowLineCount);
	FB_object.DB_SoftID = "gog/apps/" + appidArray;
	FB_object.DB_ProductAddress = "https://www.gog.com/game/" + appidArray;
	FB_object.DB_Platform = "GOG";
	pictureTemp = 'https://' + jsonSplit(splitValue, lines, 9, GOG_Split, nowLineCount) + '_product_tile_256.jpg';
	FB_object.DB_SmallPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp.replace(/\\/g, "") : pictureTemp.replace(/&amp;/g, "&").replace(/\\/g, "");
	pictureTemp = 'https://' + jsonSplit(splitValue, lines, 10, GOG_Split, nowLineCount) + '_product_tile_256.jpg';
	FB_object.DB_BigPicture = pictureTemp.indexOf("&amp;") == -1 ? pictureTemp.replace(/\\/g, "") : pictureTemp.replace(/&amp;/g, "&").replace(/\\/g, "");
	return JSON.stringify(FB_object, null, 5);
}

async function scrapingMain() {
	let fileOutput = '';
	fs.writeFile('DBresult.json', '{"ScrapingDB": [', 'utf8', function(error) {
		console.log("데이터베이스 파일 만들기: " + error);
	});
	var dataOtherJSON = JSON.parse(fs.readFileSync('otherDB').toString());
	fileOutput += JSON.stringify(dataOtherJSON, null, 5) + ",";

	console.log('크롤링 시작...');
	console.log('스팀 SW 크롤링 중...');
	let swS_splitValue = [];
	let swS_dbTemp = '';
	let swS_pageNum = parseInt(2500 / steamRepeat);//횟수
	for(let i = 0; i < swS_pageNum ; i++) {
		swS_splitValue = await sw_steamWeb(i);
		for(let j = 1; j < steamRepeat + 1; j++) {
			swS_lineTotal = (j + (i * steamRepeat) - 1);
			nowLineCount = swS_lineTotal - swS_sublineTotal + nowTempCount;
			swS_dbTemp = sw_steamDB(swS_splitValue, j, swS_pageNum);
			(swS_lineTotal != (swS_pageNum * steamRepeat) - 1) && (swS_dbTemp != "0") ? fileOutput += (swS_dbTemp + ","): fileOutput += "";
		}
	}
	nowTempCount = nowLineCount;
	console.log('스팀 SW 크롤링 완료.');
	console.log('험블번들 SW 크롤링 중...');
	let swHB_splitValue = [];
	let swHB_dbTemp = '';
	let swHB_pageNum = 10;//횟수
	for(let i = 0; i < swHB_pageNum; i++) {
		swHB_splitValue = await sw_humblebundleWeb(i);
		for(let j = 1; j < swHB_splitValue.length; j++) {
			swHB_lineTotal = (j + (i * humblebundleRepeat) - 1);
			nowLineCount = swHB_lineTotal - swHB_sublineTotal + nowTempCount;
			swHB_dbTemp = sw_humblebundleDB(swHB_splitValue, j, swHB_pageNum);
			(swHB_lineTotal != (swHB_pageNum * humblebundleRepeat) - 1) && (swHB_dbTemp != "0") ? fileOutput += (swHB_dbTemp + ","): fileOutput += "";
		}
	}
	nowTempCount = nowLineCount;
	console.log('험블번들 SW 크롤링 완료.');
	console.log('GOG 크롤링 중...');
	let GOG_splitValue = [];
	let GOG_dbTemp = '';
	let GOG_pageNum = 20;//횟수
	for(let i = 0; i < GOG_pageNum; i++) {
		GOG_splitValue = await GOGWeb(i);
		for(let j = 1; j < GOG_splitValue.length; j++) {
			GOG_lineTotal = (j + (i * gogRepeat) - 1);
			nowLineCount = GOG_lineTotal - GOG_sublineTotal + nowTempCount;
			GOG_dbTemp = GOGDB(GOG_splitValue, j, GOG_pageNum);
			(GOG_lineTotal != (GOG_pageNum * gogRepeat) - 1) && (GOG_dbTemp != "0") ? fileOutput += (GOG_dbTemp + ","): fileOutput += "";
		}
	}
	nowTempCount = nowLineCount;
	console.log('GOG 크롤링 완료.');
	console.log('스팀 크롤링 중...');
	let S_splitValue = [];
	let S_dbTemp = '';
	let S_pageNum = parseInt(500 / steamRepeat);//횟수
	for(let i = 0; i < S_pageNum ; i++) {
		S_splitValue = await steamWeb(i);
		for(let j = 1; j < steamRepeat + 1; j++) {
			S_lineTotal = (j + (i * steamRepeat) - 1);
			nowLineCount = S_lineTotal - S_sublineTotal + nowTempCount;
			S_dbTemp = steamDB(S_splitValue, j, S_pageNum);
			(S_lineTotal != (S_pageNum * steamRepeat) - 1) && (S_dbTemp != "0") ? fileOutput += (S_dbTemp + ","): fileOutput += "";
		}
	}
	nowTempCount = nowLineCount;
	console.log('스팀 크롤링 완료.');
	console.log('험블번들 크롤링 중...');
	let HB_splitValue = [];
	let HB_dbTemp = '';
	let HB_pageNum = 30;//횟수
	for(let i = 0; i < HB_pageNum; i++) {
		HB_splitValue = await humblebundleWeb(i);
		for(let j = 1; j < HB_splitValue.length; j++) {
			HB_lineTotal = (j + (i * humblebundleRepeat) - 1);
			nowLineCount = HB_lineTotal - HB_sublineTotal + nowTempCount;
			HB_dbTemp = humblebundleDB(HB_splitValue, j, HB_pageNum);
			(HB_lineTotal != (HB_pageNum * humblebundleRepeat) - 1) && (HB_dbTemp != "0") ? fileOutput += (HB_dbTemp + ","): fileOutput += "";
		}
	}
	nowTempCount = nowLineCount;
	console.log('험블번들 크롤링 완료.');
	console.log('크롤링 종료');
	if(fileOutput.slice(-1) == ",") {
		fileOutput = fileOutput.slice(0, -1);
	}

	fs.appendFile('DBresult.json', fileOutput + ']}', 'utf8', function(error) {
		console.log("데이터베이스 파일 쓰기: " + error);
	});
	console.log("크롤링 및 데이터베이스 생성 끝");
}

const jsonToFirestore = async(jsonName) => {
	try {
		console.log('Firebase 초기화 중...');
		await firestoreService.initializeApp(serviceAccount, firebaseConfig.databaseURL);
		console.log('Firebase 초기화 완료');
		await firestoreService.restore('./' + jsonName);
		console.log(jsonName + ' 업로드 성공');
	} catch(error) {
		console.log('Firebase 업로드 에러: ' + error);
	}
};

const jsonBackup = async(jsonName) => {
	try {
		console.log(jsonName + ' 다운로드 중...');
		firestoreService.initializeApp(serviceAccount, firebaseConfig.databaseURL)
		const { backup } =  require('firestore-export-import')
		backup('ScrapingDB').then((data) => {
			const  json  =  JSON.stringify(data);
			fs.writeFile(jsonName, json, 'utf8',()=>{
				console.log(jsonName + ' 다운로드 성공');
		})
	});
	} catch(error) {
		console.log('Firebase 다운로드 에러: ' + error);
	}
};

const deleteEmptyMessages = async (deletePlatform) => {
	const postsRef = dbFBI.collection('ScrapingDB');
	const query = postsRef.where("DB_Platform", "==", deletePlatform).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        const deleteDoc = dbFBI.collection('ScrapingDB').doc(doc.id).delete();
      });
    })
    .catch(err => {
      console.log('Error getting Steam documents', err);
    });
  };

async function WebScraper() { //24시간 반복 기능 삭제
	await deleteEmptyMessages("Steam");
	await deleteEmptyMessages("HumbleBundle");
	await deleteEmptyMessages("GOG");
	await deleteEmptyMessages("Other");
	//await jsonBackup("DBbackup.json");
	await scrapingMain();
	await jsonToFirestore("DBresult.json");
	console.log(nowTempCount + "개 가량의 핫딜 상품 확보");
	console.log("크롤링 및 파이어베이스 업로드 종료");
}

WebScraper();