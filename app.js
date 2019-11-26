//Budget controller
var budgetController  = (function (){
    
    var Expenses = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };
    
    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
        var calculateTotal =  function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(current) {
                sum += current.value;
            });  
            data.totals[type] = sum;
        };

    var data = {
       allItems: {
            exp: [],
            inc: []
        },
         totals: {
            inc:0,
            exp:0
        }, 
         budget : 0,
         percentage : -1 // because percentage is a non existant value
    };
    return {
        addItem: function(type,des,val){
            var newItem,ID;
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            } 
            
            //Create new item based on 'inc' or 'exp'
            if(type === 'exp'){
                newItem = new Expenses(ID,des,val);
            }
            else if (type === 'inc'){
                newItem = new Income(ID, des, val);
        }
        
        // Push our new data item into our data structure 
        data.allItems[type].push(newItem);
    
        //Return the new data element
        return newItem;
           
    },
        deleteItem: function(type, id){
         
        var ids,index; 
        ids = data.allItems[type].map( function (current) {
            return current.id;
        });
            
        index = ids.indexOf(id);
        
            if(index !== -1){
                data.allItems[type].splice(index , 1);
            }
        },
        
        
       calculateBudget: function (){
        //Calculate the total income and expenses 
           calculateTotal('exp');
           calculateTotal('inc');
           
        //Calculate the total budget i.e. income - expenses
           data.budget = data.totals.inc - data.totals.exp; 
           
        //Calculate the total percentage of the income being used as the expenses
           if(data.totals.inc > 0){
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
           }
           else{
               data.percentage = -1;
           }
       
       },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
               cur.calcPercentage(data.totals.inc);
            });
        },
        
         getPercentages: function (){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
             return allPerc;
         },
        
        getBudget: function(){
         return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
             };
            
        },
        
        testing: function(){
            console.log(data);
        }
    }
    
})();

//UI controller
var UIcontroller = (function (){
    var DOMStrings = {
        typeInput: '.add__type',
        descriptionInput: '.add__description',
        valueInput: '.add__value',
        addBtn: '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        conatainer: '.container',
        percentLabel: '.item__percentage',
        dataLabel: '.budget__title--month'
    };
     var  formatNumber =  function(num,type){
            // - or + before the number
            // there must be 2 decimal place
            var numSplit;
            var dec ,int;

            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
               if(  int.length > 3 ){
                  int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
               }
               
               dec = numSplit[1];
               return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
}
    
              var nodeListForEach = function(list, callback){
              for(var i = 0; i < list.length; i++){
                  callback(list[i], i);
                }
            };

    return {
         getInput: function (){
         return {
         type: document.querySelector(DOMStrings.typeInput).value,
         description: document.querySelector(DOMStrings.descriptionInput).value,
         value: parseFloat(document.querySelector(DOMStrings.valueInput).value)
        };    
      },
        
               addListItem : function(obj, type){
            var html, newhtml,element;
            //Create HTML string with placeholder text 
            if(type === 'inc'){
              element = DOMStrings.incomeContainer;
                
               html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div</div></div>'
    }
            else if (type === 'exp'){
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace the placeholder with some actual data
            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value,type));
            
          //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },   
         
        deleteListItem : function(selector){
           var el;
            el = document.getElementById(selector);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields,fieldArr;
            fields = document.querySelectorAll(DOMStrings.descriptionInput + ','+ DOMStrings.valueInput);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function (current,index,array){
            current.value = "";
            });
            fieldArr[0].focus();  
   },
        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
                
            }
              else {
                 document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
    },
        displayPercentages : function(percent){
            
            var field = document.querySelectorAll(DOMStrings.percentLabel);
            nodeListForEach(field, function(current, index){
                
                if(percent[index] > 0){
                    current.textContent = percent[index] + '%';
                }
                else{
                    current.textContent = '--';
                }
                
            });
            
        },
        displayDate: function(){
          
            var now,year,month;
            var months;
            now = new Date();
            
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin', 'Kartik', 'Mangsir', 'Poush','Magh', 'Falgun', 'Chaitra'];
            
            document.querySelector(DOMStrings.dataLabel).textContent = months[month] + ' ' + (year+57);         
        },
        
        uiDesign : function(){
            var fields;
            
            fields = document.querySelectorAll(DOMStrings.typeInput+ ',' +
                                              DOMStrings.descriptionInput + ',' +
                                              DOMStrings.valueInput);
            
            
            nodeListForEach(fields , function(cur){
               
                cur.classList.toggle('red-focus');
                
            });
         document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        
        },
        
        getDOMstrings : function (){
          return DOMStrings;
        }
    };
})();

//Controller module
var controller = (function(budgetctlr, UIctrl){
    
     var setupEventListener = function(){
     var DOM = UIctrl.getDOMstrings();
     document.querySelector(DOM.addBtn).addEventListener('click',cltrAddItem);
     document.addEventListener('keypress',function (event){
     if(event.which === 13 || event.keyCode === 13){
              cltrAddItem();
         }
        
    });
         
     document.querySelector(DOM.conatainer).addEventListener('click',ctrlDelItem);
         
     document.querySelector(DOM.typeInput).addEventListener('change',UIctrl.uiDesign);
        
};
    
    var updateBudget = function (){
        
    //1. Calculate the budget.
    budgetctlr.calculateBudget();
        
    //2. Return the budget
    var budget = budgetctlr.getBudget();
        
    //3. Display the budget.
     UIctrl.displayBudget(budget);
};
     var updatePercentages = function(){
         
         //1. Calculate the percentage 
         budgetctlr.calculatePercentages();
         
         //2. Read the percentages from the budget controller
         var per = budgetctlr.getPercentages();
        
         //3.Update the user interface.
          UIctrl.displayPercentages(per);
     };
    
    
     var cltrAddItem = function(){
         var input, addItem;
         // 1.Get the field input data. 
         input = UIctrl.getInput();
         
         if(input.description !== "" && !isNaN(input.value) && input.value > 0)
         {
        // 2. Add the item to the budget controller.
         addItem = budgetctlr.addItem(input.type, input.description, input.value)
        
        //3. Add the item to the user interface.
         UIctrl.addListItem(addItem,input.type);
         
        //4. Clearing out the input field
         UIctrl.clearFields();
         }
         //5.Update the budget
         updateBudget();
         
         //6. Update the percentages. 
         updatePercentages();
         
     };
    
     var ctrlDelItem = function (event) {
         var itemID,splitID,type, Id;

         itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
         console.log(itemID);
         
         if(itemID){
             splitID = itemID.split('-');
             type = splitID[0];
             Id = parseInt (splitID[1]);
             
             //1.Delete the item from the data structure
             budgetctlr.deleteItem(type , Id);
             
             //2. Delete the data item from the user interface 
             UIctrl.deleteListItem(itemID);
             
             //3. Recalculate and update the budget and update the user interface
            
             updateBudget();
             
             //4.Update the percentages. 
                
             updatePercentages();
          }
         
     };
    return {
             init: function(){
            UIctrl.displayDate();
             UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
             });
             setupEventListener();
        }
    }
    
})(budgetController,UIcontroller);

controller.init();