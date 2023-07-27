
/**
 * Checking out the cart
 * @param {array} data 
 * @returns string
 */
async function checkout(data){
    const date = new Date();

    const orderData = {
        name        : data.Name,
        phone       : data.Telephone,
        price       : vueApp.getTotal,
        products    : vueApp.cart,

        date: {
            year    : date.getFullYear(),
            month   : date.getMonth()+1,
            day     : date.getDate(),            
            hour    : date.getHours(),
            minutes : date.getMinutes(),
            seconds : date.getSeconds()
        }
    }

    async function callBack(response){
        if(isNaN(response)){
            for(const item of orderData.products){
                const spaces = await ajax({id: item.id}, x => JSON.parse(x).spaces, "get", "mongoDB/products/findOne");
                await ajax([{id: item.id}, {"$set": {spaces: spaces - item.qty}}], "", "patch", "mongoDB/products/findOneAndUpdate");
            }
            alert("Checkout successfully completed!\r\nReloading simulation..");
            location.reload();
        }else alert("I'm sorry, something went wrong!\r\nError: ", response);
    }

    return await ajax(orderData, callBack, "post", "mongoDB/orders/insertOne");
}

/**
* here will be checked and validate any type of data entered into the forms
* @param  {Object}  element DOM element (form or input)
* @return {Boolean} Boolean which determines the form submission
*/
function validateForm(element){
    if(element.tagName != "BUTTON"){ //if just a focus-out of the inputBox
            const validate = new Validation(element);
            const result = validate.inputs();
            return result;
    }else if(vueApp.cart.length > 0){                          //if the button as been presse
        const elemForm = element.form;
        const validate = new Validation(elemForm, true);
        const TorF = validate.inputs();
        TorF? checkout(validate.getData()): console.log("void button");

    }else alert("Sorry, you cannot checkout an empty cart!");
    return false; 
}




// Validation Form
class Validation {
    constructor(element){    
        //-------------------------------local variables----------------------------------------
        let elObj       = new Object;   //form data object
        let parent      = element.name; //form name
        let currentUser = "";
        let kList;                      //list of data Object keys

        //setting the currentUser variable when "user" key exists inside the session storage
        if(sessionStorage.getItem("user")){
            currentUser = JSON.parse(sessionStorage.getItem("user"))["eMail"];
            console.log(currentUser);
        }

        //--------------------setting the kList, elObj and parent variable---------------------
        if(element.tagName === 'INPUT'){ //the previous intruction was && element.type === 'text') {
            kList = [element.getAttribute('name')];
            elObj[element.getAttribute('name')] = element.value;
            parent = element.form.name; //the previous intruction was .parentNode.name;
        }else {
            const formEntries = new FormData(element).entries();
            elObj = Object.assign(...Array.from(formEntries, ([name, value]) => ({[name]: value})));
            kList = Object.keys(elObj);
        }

        /* making variales visible outsite the contructor*/
        this.elObj			= elObj;		//Object containing user/form data el-Obj:  el= elements, Obj= Object
        this.kList			= kList;		//list of Keys from the form
        this.parent			= parent;		//getting form name
        this.currentUser	= currentUser;	//gettin current user if any from sessionStorage

        this.label			= null;
        this.Tof			= true;			//Boolean which determines the form submission
        this.element		= element;
        this.oneElement		= element;
    }

    // -------------------------------singol fild validation----------------------------------

    validLetters(value){
        if (/^([a-z]+\s?)+$/gi.test(value)){
            this.#styleSet(); //settin the input box style
            return true;
        }else   this.#styleSet(value=="", "Just letters!"); //settin the input box style
        return false;
    }

    validPhone(value){
        if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/gi.test(value)){
            this.#styleSet(); //setting the input box style back to normal
            return true;
        }else   this.#styleSet(value=="", "Wrong format!"); //settin the input box style
        return false;
    }

    validEmail(value, key){
        if (/^[\w\.\-]+\@([\w\-]+\.)+([a-z0-9]{2,4})$/gi.test(value)){
            this.#styleSet(); //settin the input box style back to normal

            //local storage value to lowerCase
            value = value.toLowerCase();
            let locStoVal = localStorage[value];
            let local = value in localStorage ? JSON.parse(locStoVal)[key].toLowerCase():null;

            //if the element comes from the FormSignIn
            if(this.parent == "formSignin" && value !=""){
                if(value != local){
                    this.#styleSet(false, "Not registered!"); //settin the input box style
                    return false;
                }else   this.elObj[key] = value; //overwriting a elObj value
            }else if (value == local && (this.parent == "formSignup" || this.parent == "formEdit" && value != this.currentUser)){
                console.log(this.parent+ " "+this.currentUser+" "+value);
                this.#styleSet(false, "Already registered!"); //settin the input box style
                return false;
            }else   this.elObj[key] = value; //overwriting a elObj value
            return true;

        }else   this.#styleSet(value=="", "Wrong format!"); //settin the input box style
        return false;
    }

    validUsername(value, key){
        if (/^(\w+[.|-]*)+$/gi.test(value)){
            this.#styleSet(); //settin the input box style back to normal

            //-------------------------searching Nikname existence-----------------------
            //if the current user exixst in loclStorage
            let currentOwnsNik = this.currentUser in localStorage? value == JSON.parse(localStorage[this.currentUser])[key]: false;
            let NikIsInLocal = false;

            for (let nik of Object.entries(localStorage)){
                nik=JSON.parse(nik[1])[key]; //in this case, key is "nikname"
                NikIsInLocal = NikIsInLocal == true ? true : value == nik ? true : false;;
            }
            //if the nikname exist already in the localStorage
            if (NikIsInLocal && (this.parent == "formSignup" || (this.parent == "formEdit" && !currentOwnsNik)) ){
                this.#styleSet(false, "Is taken!"); //settin the input box style
				return false;
            }else return true;
			//-------------------------------end of searching-----------------------------
        }else   this.#styleSet(value=="", "Wrong format!"); //settin the input box style
		return false;
    }

	validPassword(value, key){
		if (/^[\w|\W]{8,}$/gi.test(value)){
			this.#styleSet(); //settin the input box style back to normal

			//if the element comes from FormSignIn and elements of the form are just 2
			const user = localStorage[this.elObj["eMail"]] || localStorage[this.elObj["email"]] || localStorage[this.elObj["Email"]];
			let localPass = user==undefined ? null: JSON.parse(user)[key];

			if(this.parent == "formSignin" && this.kList.length == 2 && value != localPass){
				this.#styleSet(false, "Wrong Password!"); //settin the input box style
				return false;
			}else return true;
		}else   this.#styleSet(value=="", "At least 8!"); //settin the input box style
		return false;
	}

	validRepeatPass(value){
		if (value == this.elObj["Password"] || value == this.elObj["password"] || value == this.elObj["pass"] || value == this.elObj["Pass"]){
			this.#styleSet(); //settin the input box style back to normal
			return true;
		}else if(this.kList.length > 2){
			this.#styleSet(value=="", "Not matching!"); //settin the input box style
			return false;
		}
	}

    //--------------------------cicling all the kList element(keys)---------------------------
    /**
     * Operating with each input box
     * @return  {Boolean} Boolean which determines the form submission
     */
    inputs(){
        const elObj       = this.elObj;       //Object containing user/form data el-Obj:  el= elements, Obj= Object
        const kList       = this.kList;       //list of Keys from the form
        let ToF           = this.Tof;         //Boolean which determines the form submission
        
        console.log(kList);
        console.log(elObj);
        for(let i=0 ; i<kList.length ; i++){
            const key = kList[i];
            let value = elObj[key];
            if (kList.length !== 1) this.oneElement = this.element[key];

            this.label = this.oneElement.parentNode.getElementsByTagName("LABEL")[0]; //getting the label

            switch (key.toLowerCase()){
                case "name": case "surname": case "country": //3 cases format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validLetters(value)?		ToF: false;
                    break;
                case "phone": case "telephone": case "mobile": //3 cases format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validPhone(value)?		ToF: false;
                    break;
                case "email": //email format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validEmail(value, key)?	ToF: false;
                    break;
                case "nikname": case "username": //nikname format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validUsername(value,key)?ToF: false;
                    break;
                case "password": case "pass": //password format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validPassword(value,key)?ToF: false; 
                    break;
                case "repeat-pass": case "repeatpass": case "repeat-password": case "repeatpassword": //4 cases format validation
                    //if the ToF is flase already then keep it false otherwise true
                    ToF = this.validRepeatPass(value)?	ToF: false; 
                    break;
            } 
            console.log(key + " " + value);
            console.log(ToF);
        }
        this.ToF = ToF;
        return ToF;
    }


    
    //-----------------------setting the wrong fields style in html--------------------------
    /**
     * Styling the text of the dom input box
     * @param  {Boolean} WoR Determine the displayin of the "wrong" message
     * @param  {String}  message Message Text
     */
     #styleSet(WoR, message){
        WoR = WoR == null? true: WoR;
		message = message == null? "": message;

        if(WoR){                            //setting style back to normal
            this.oneElement.style.color = "";
            this.label.innerHTML        = this.oneElement.name;
            this.label.style.color      = "";
        }else{                              //setting style to wrong
            this.label.innerHTML        = message;
            this.label.style.color      = "red";
            this.oneElement.style.color = "red";
        }
    }

    //-----------------------getters methods--------------------------

    getData(){
        return this.elObj;
    }

}