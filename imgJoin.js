/*
version: 0.0.1
author: shynome
请把宽度差不多的图片放在一起
*/

'use strict'

const co = function (){
	'use strict'
	let	isGen = x => x .constructor === GenConstructor
	,	isP = x => x .constructor === Promise
	,	isA = Array .isArray
	,	GenConstructor = (function*(){}) .constructor
	,   entry = gen => ( gen === undefined || gen === null )
	? Promise.resolve(gen)
	: isP(gen)
	? gen
	: isA(gen)
	? Promise.all(gen)
	: typeof gen !== 'function' 
	? Promise.resolve(gen) 
	: isGen(gen)
	? runGen(gen)
	: (new Promise(rl=>rl(gen())))

	,	runGen=(gen)=>new Promise((rl,rj)=>{
		gen=gen()
		let	run=(val)=>{
			try{
				let result=gen.next(val)
				,	value=result.value
				if(result.done)return rl(value);
				entry(value).then(run,rj)
			}catch( err ){
				rj( err )
			}
		}
		run()
	})
	return entry
}()

let imgs = {}
,	bodyStyle = {
	background: "", 
	transition: "all linear .5s", 
}
,	canvasStyle = {}
,	imgsBar = document.getElementById('img')
,	canvas = window .canvas = document .getElementById('canvas')
,	canvasOld =  document .getElementById('canvasOld')
,	ctx = window .ctx =  canvas.getContext('2d')
,	A = window.A = document .querySelectorAll('a')
,	clickEvent = function () {
	let evt = document .createEvent('HTMLEvents')
	evt .initEvent('click', false, false)
	return evt
}

let	append = ( files ) => co(function*(){
	let l = files .length
	if( ! l )return;
	for( let i = 0; i < l; i++ ){
		let file = files[ i ]
		if( !(/image/i .test( file .type )) )continue;
		if( imgs[ file .name ] )continue;//已经有了同名的话不再渲染
		let url = URL .createObjectURL( file )
		let {
			height, width,
		} = yield new Promise((resolve, reject) => {
			imgsBar .onload = () => {
				resolve({
					width: imgsBar .width,
					height: imgsBar .height,
				})
			}
			imgsBar .onerror = reject
			data['imgsBarUrl'] = url
		})
		let position = data[ 'height' ]
		yield new Promise((resolve, reject) => {
			let blob = canvas .toBlob( b => {
				if( !b ){
					if( data[ 'width' ] < width )data[ 'width' ] = width;
					data[ 'height' ] += height
					Vue.nextTick( resolve )
					return;
				};
				data[ 'canvasOld' ] = URL .createObjectURL( b )
				canvasOld .onload = () =>{
					if( data[ 'width' ] < width )data[ 'width' ] = width;
					data[ 'height' ] += height
					Vue .nextTick( () =>{
						resolve(draw( 0, canvasOld ) )
					})
				}
				canvasOld .onerror = reject
			})
		});
		yield draw( position, imgsBar )
		Vue .set( imgs, file .name, {
			position,//位置定位只有高度一项
			width,
			height,
		})
	}
})
,	draw = ( y, img ) =>co(function*(){
	ctx .drawImage( img, 0, y )
	return
})

let data = {
	imgs,
	width:0,
	height:0,
	doing:0,
	outputing:0,
	output: (Math.random()*100000).toFixed(0),
	pngUrl:'',
	jsonUrl:'',
	imgsBarUrl: '',
	canvasOld: '',
	bodyStyle, canvasStyle,
}
,	methods = {
	drop( e ){
		bodyStyle[ 'background' ] = ''
		let obj, {
			types,
			files,
		} = obj = e .dataTransfer
		data[ 'doing' ] = 1
		append( files ).then(()=>{
			data['doing'] = 0
		},( e )=>{
			window.alert('执行失败,请使用F12打开控制台查看具体信息')
			console .log( (e && e .stack) || e )
		})
	},
	dragenter( ){
		bodyStyle[ 'background' ] = 'red'
	},
	toPng(){
		if(data['doing'])return;
		data[ 'outputing' ] = 1
		canvas .toBlob( b =>{
			if( !b ){
				data[ 'outputing' ] = 0
				window.alert('请拼接图片后再进行导出') ;
				return 
			}
			let json = new Blob( [ Vue.filter('json').read(imgs) ], {
				type: 'application/json',
			} )
			data['pngUrl'] = URL .createObjectURL( b )
			data['jsonUrl'] = URL .createObjectURL( json )
			Vue .nextTick( ()=>{
				for(let i=0,l=A.length;i<l;i++){
					A[i].dispatchEvent( clickEvent() )
				}
				data[ 'outputing' ] = 0
			})
		}, 'image/png')
	}
}


let vm = window .vm = new Vue({
	el: 'html',
	data, 
	methods,
})