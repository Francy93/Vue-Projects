
/**
 * Checking whether astring is a json or not
 * @param {string} string 
 * @returns {boolean} true or false
 */
function isJSON(string){
    try { JSON.parse(string); }
    catch (e) { return false; }  
    return true;
}

/**
 * Ajax technique to communicate with the server
 * @param  {Any}      data data to be sent to server
 * @param  {Function} operation a variable containing a function
 * @param  {String}   method communication method, like: "POST", "GET", "PUT", "DELETE"
 * @param  {String}   url to specify the php page to communicate with
*/
async function ajax(data, operation, method, url){

    data     = data     ? data     : true;
    operation= operation? operation: x => { console.log("No operation: "+x); return x; };
    method   = method   ? method   : "POST";
    url      = url      ? url      : location.pathname.substring(location.pathname.lastIndexOf("/") + 1);

    method = method.toUpperCase();
    data = typeof data === 'string'? data: JSON.stringify(data);

    //converting the data in "post" data
    function getFormData(object) {
        let formData = new FormData();
        Object.keys(object).forEach(key => formData.append(key, object[key]));
        return formData;
    }

    //handling server response
    function res(response){
        if (response.ok) return response.text().then(resp => resp);
        else throw new Error(response.statusText, {cause: response});
    }

    // server error handler
    function exception(error){
        console.error(error.cause? 'Exception ➤ ' + error.cause.url + "\r\n" + error.cause.status + " ("+error.message+")": error);
        return error.cause? error.cause.status: false;
    }


    //performing the HOLLY ajax technique
    switch(method){
        case "POST":
            output = await  fetch( url, {
                                method: method,
                                body:   getFormData({ajax: data}),
                            }).then(response => res(response))
                            .catch(error => exception(error));
            break;
        case "GET":
            output = await  fetch(url+"?"
                                +"ajax"+"="
                                + data
                            ).then(response => res(response))
                            .catch(error => exception(error));
            break;
        case "DELETE":
            data = isJSON(data)? JSON.parse(data): data;
            output = await  fetch(url + '/' + JSON.stringify({ajax: data}), {
                                method: method,
                            }).then(response => res(response))
                            .catch(error => exception(error));
            break;
        case "PUT": case "PATCH":
            output = await  fetch(url + "/" + "ajax", {
                                method: method,
                                headers:{"Content-Type": "application/json"},
                                body:   JSON.stringify({ajax: data})
                            }).then(response => res(response))
                            .catch(error => exception(error));
            break;
        default: console.error("Wrong ajax method!");
            return; //this return avoids "operation" to be executed
    }

    //running the asycronous operation
    return operation(output);
}



/**
 * Array QuickSort
 * @param {array} arr 
 * @param {boolean} mode 
 * @param {?number[]} path 
 * @returns {array} sorted array
 */
function quickSort(arr, mode, ...path){
	length = arr.length;

	if(length > 0){
		arr = [...arr]; // cloning array
		mode = mode == null? true: mode;
		path = path.length === 1 && Array.isArray(path[0])? path[0]: path;

		//higher scope variables not recursively defined
		let pivot = "", mid = 0, l = 0, r = length-1;

		//getting the element through a specified path (...path)
		function getElement(index){
			let e = arr[index]; 
			for(let i=0; i<path.length; i++){
				let p = !isNaN(parseInt(path[i])) && path[i] >= 0? parseInt(path[i]): 0;
				e = p<e.length? e[p]: (typeof e === 'object' && p<Object.entries(e).length? Object.entries(e)[p]: []);
		  	}
			return e;
		}

		//recursive lambda function
		(function recur(left, right){

			l = left, r = right;
			mid = Math.floor( (l+r) / 2 );

			//getting the pivot
			pivot = getElement(mid);
			// partition
			while (l <= r) {
				// loop left index if the current element is smaller or greater than pivot
				while (mode? getElement(l) < pivot: getElement(l) > pivot)	l++;
				// loop right index if the current element is greater or smaller than pivot
				while (mode? getElement(r) > pivot: getElement(r) < pivot)	r--;

				if (l <= r) {
					let tmp	 = arr[l];
					arr[l++] = arr[r];
					arr[r--] = tmp;
				}
			}
			// recursion
			if (left < r ) recur(left, r );
			if (l < right) recur(l, right);
		})(l,r);
	}

	return arr;
}


/**
 * Generating the carousel
 * @param {number} length 
 * @returns {string}
 */
function carouselGen(length){
	length = !isNaN(parseInt(length)) && parseInt(length) > 0? parseInt(length): vueApp.showcase.length;
	const pageSize = 6;

	function pageGen(num, mode){
		mode = mode? "active": "";
		const index = Math.ceil((num / pageSize) - 1) * pageSize;
		const cycles = (num % pageSize) > 0? (num % pageSize): pageSize;

		return `
			<div class="item ${mode}">

				<div v-for="index in ${cycles}" :key="index" class="col-xs-12 col-sm-4 col-md-4">
					<div class="card wrap">
						<div class="card front">
							<img class="img"	v-bind:src="showcase[index+${index}-1].image">
							<h2  class="title"	v-text="showcase[index+${index}-1].title"></h2>
						</div>
						
						<div class="card back">
							<img class="img"	v-bind:src="showcase[index+${index}-1].image">
							<div class="info container">
								<div class="description">
									<p class="location"	>Location: {{showcase[index+${index}-1].location}}</p>
									<p class="price"	>Price: {{showcase[index+${index}-1].price}}£</p>
									<p class="space"	>Spaces: {{showcase[index+${index}-1].spaces}}</p>
								</div>
								<img class="logo"	v-bind:src="showcase[index+${index}-1].logo">
							</div>
							<button v-if="canAddToCart(showcase[index+${index}-1])" class="btn btn-primary" type="button" v-on:click="addToCart(showcase[index+${index}-1])">ADD TO CART</button>
							<button v-else disabled="disabled" class="btn btn-primary" type="button">ADD TO CART</button>
						</div> 
					</div>							
				</div>

			</div>


		`;
	}

	function indicators(){
		
		let indicators = "<ol class='carousel-indicators'>";

		for(let i=0; i<Math.ceil(length/pageSize); i++){
			indicators += `<li data-target='#carousel-cards' data-slide-to='${i}'${ i==0?" class='active'": ""}></li>`;
		}

		return indicators + "\n</ol>"; 
	}

	function pages(){
		let pages = "";

		do{
			var i = typeof i == 'undefined'? pageSize: i + pageSize;
			pages += pageGen(i<=length?i: length, i<=pageSize) + "<!-- nex carousel page -->";
		}while(i < length);

		return pages;
	}
	

	let carousel =`
		<div class="carousel-inner" role="listbox">
			${pages()}
		</div>
	`;
	
	let controls =`
		<a href="#carousel-cards" class="left carousel-control" role="button" data-slide="prev">
			<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
		</a>
		<a href="#carousel-cards" class="right carousel-control" role="button" data-slide="next">
			<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
		</a>
	`;

	let output =`
		<!-- Indicators -->
			${indicators()}

		<!-- Carousel -->	
			${carousel}
					
		<!-- Controls -->
			${controls}
	`;

	return output;
}