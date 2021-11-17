'use strict';

function checkout(){
    alert("Checkout successfully completed!\nReloading simulation..");
    location.reload();
}

/**
* here will be checked and validate any type of data entered into the forms
* @param  {Object}  element DOM element (form or input)
* @return {Boolean} Boolean which determines the form submission
*/
function validateForm(element){
    if(element.tagName != "BUTTON"){ //if just a focus-out of the inputBox
            const validate = new Validation(element);
            let result = validate.inputs();
            return result;
    }else if(vueApp.cart.length > 0){                          //if the button as been presse
        const elemForm = element.form;
        const validate = new Validation(elemForm, true);
        let TorF = validate.inputs();
        TorF? checkout(): console.log("void button");
        
        return false; 
    }else alert("Cannot checkout an empty cart!");
}

// Validation Form
class Validation {
    constructor(element, submit){    
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
        this.elObj			= elObj;
        this.kList			= kList;
        this.parent			= parent;
        this.currentUser	= currentUser;

        this.label			= "";
        this.Tof			= true;
        this.submit			= submit;
        this.element		= element;
        this.oneElement		= element;
    }

    //--------------------------cicling all the kList element(keys)---------------------------
    /**
     * Operating with each input box
     * @return  {Boolean} Boolean which determines the form submission
     */
    inputs(){
        const elObj       = this.elObj;       //Object containing user/form data el-Obj:  el= elements, Obj= Object
        const kList       = this.kList;       //list of Keys from the form
        const parent      = this.parent;      //getting form name
        const currentUser = this.currentUser; //gettin current user if any from sessionStorage
        let ToF           = this.Tof;         //Boolean which determines the form submission
        
        console.log(kList);
        console.log(elObj);
        for(let i=0 ; i<kList.length ; i++){
            const key = kList[i];
            let value = elObj[key];
            if (kList.length !== 1) this.oneElement = this.element[key];

            this.label = this.oneElement.parentNode.getElementsByTagName("LABEL")[0]; //getting the label

            switch (key.toLowerCase()){
                case "name": case "surname": case "country":
                    //3 cases format validation
                    if (/^([a-z]+\s?)*$/gi.test(value)){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                    }else{ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "Just letters!"); //settin the input box style
                    }
                    break;
                case "phone": case "telephone": case "mobile":
                    //3 cases format validation
                    if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/gi.test(value)){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                    }else{ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "Just numbers!"); //settin the input box style
                    }
                    break;
                case "email":
                    //email format validation
                    if (/^([\w\.\-]+\@([\w\-]+\.)+([a-z0-9]{2,4}))?$/gi.test(value)){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                        //local storage value to lowerCase
                        value = value.toLowerCase();
                        let locStoVal = localStorage[value];
                        let local = value in localStorage ? JSON.parse(locStoVal)[key].toLowerCase():null;
                        //if the element comes from the FormSignIn
                        if(parent == "formSignin" && value !=""){
                            if(value != local){
                                ToF = false;
                                this.#styleSet(ToF, "Not registered!"); //settin the input box style
                            }else {this.elObj[key] = value}; //overwriting a elObj value
                        }else if (value == local && (parent == "formSignup" || 
                                  parent == "formEdit" && value != currentUser)){
                            console.log(parent+ " "+currentUser+" "+value);
                            ToF = false;
                            this.#styleSet(ToF, "Already registered!"); //settin the input box style
                        }else {this.elObj[key] = value}; //overwriting a elObj value
                    }else{ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "Wrong format!"); //settin the input box style
                    }
                    break;
                case "nikname":
                    //nikname format validation
                    if (/^(\w+[.|-]*)*$/gi.test(value)){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                        //-------------------------searching Nikname existence-----------------------
                        let currentOwnsNik=false;
                        //if the current user exixst in loclStorage
                        if (currentUser in localStorage){
                            currentOwnsNik = value == JSON.parse(localStorage[currentUser])[key]? true:false;
                        }
                        let NikIsInLocal = false;
                        for (let nik of Object.entries(localStorage)){
                            nik=JSON.parse(nik[1])[key]; //in this case, key is "nikname"
                            NikIsInLocal = NikIsInLocal == true ? true : value == nik ? true : false;;
                        }
                        //if the nikname exist already in the localStorage
                        if (NikIsInLocal && 
                                (parent == "formSignup" || (parent == "formEdit" && !currentOwnsNik)) ){
                            ToF = false;
                            this.#styleSet(ToF, "Is taken!"); //settin the input box style
                        }//-------------------------------end of searching-----------------------------
                    }else{ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "Wrong format!"); //settin the input box style
                    }
                    break;
                case "password":
                    //password format validation
                    if (/^([\w|\W]{8,})?$/gi.test(value)){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                        //if the element comes from FormSignIn and elements of the form are just 2
                        if(parent == "formSignin" && kList.length == 2){
                            const user = localStorage[elObj["eMail"]];
                            let localPass = user==undefined ? null: JSON.parse(user)[key];
                            if(value != localPass){
                                ToF = false;
                                this.#styleSet(ToF, "Wrong Password!"); //settin the input box style
                            }
                        }
                    }else{ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "At least 8!"); //settin the input box style
                    }
                    break;
                case "repeat-pass":
                    if (value === elObj["Password"]){
                        //if the ToF is flase already then keep it false otherwise true
                        ToF = ToF?(value!=""): false;
                        this.#styleSet(true, ""); //settin the input box style
                    }else if(kList.length > 2){ 
                        ToF = this.submit? false: value=="";
                        this.#styleSet(ToF, "No match!"); //settin the input box style
                    }
                    break;
            } 
            console.log(key + " " + value);
            console.log(ToF);
        }
        this.ToF = ToF;
        return this.#validated();
    }

    // this private function will store data and allow form to be submitted
    #validated(){
        let elObj       = this.elObj;
        const parent    = this.parent;
        let currentUser = this.currentUser;

        if(this.ToF && this.kList.length > 1){

            if(parent == "formSignup"){
                localStorage.setItem(elObj["eMail"], JSON.stringify(elObj));    //sava 7 data to local storage; (elObj)
            }else if(parent == "formEdit"){
                currentUser = JSON.parse(sessionStorage.getItem("user"))["eMail"];
                console.log(currentUser);
                localStorage.removeItem(currentUser);
                localStorage.setItem(elObj["eMail"], JSON.stringify(elObj));   //sava 7 data to local storage; (elObj)
            }
            elObj = { eMail : elObj["eMail"], Password : elObj["Password"] };
            sessionStorage.setItem("user", JSON.stringify(elObj));  //sava 2 data to session storage; (elObj)
        }
        return this.ToF;
    }

    
    //-----------------------setting the wrong fields style in html--------------------------
    /**
     * Styling the text of the dom input box
     * @param  {Boolean} WoR Determine the displayin of the "wrong" message
     * @param  {String}  message Message Text
     */
     #styleSet(WoR, message){
        if(WoR){                            //setting style back to normal
            this.oneElement.style.color = "";
            this.label.innerHTML        = this.oneElement.name;
            this.label.style.color      = "";
        }else{                              //setting style to wrong
            this.label.innerHTML        = message;
            this.label.style.color      = "red";
            this.oneElement.style.color = "red";
        }
    } //this function will be called inside the "switch"

}