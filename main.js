// Create function Validator
function Validator (options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    // function do validate
    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)  

        // Get earch of rule 
        var rules = selectorRules[rule.selector]

        // Loop to each of rule and check 
        // if false then stop check
        for (var i = 0; i < rules.length; i++){
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox': 
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default: 
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) {
                break;
            }
        }

        // value: inputElement.value
        // test func: rule.test
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        return !errorMessage
    }

    // Get form with id #form-1
    // Get element of form need to validate
    var formElement = document.querySelector(options.form)
    // console.log(options.rules)
    if (formElement) {

        // When submit form
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true;

            // Loop through rules and validate them 
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })
            
            if (isFormValid) {
                // Case 1: submit with javascript callback
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = ''
                                    return values
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break
                            
                            default:
                                values[input.name] = input.value
                                break;
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
            }

            // Case 2: submit with event default 
            else {
                // formElement.submit();
            }
        }

        // Loop through rules and handle it (event listener such as: blur, input)
        options.rules.forEach(function (rule) {
            // Save each of rule for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }
            else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {
                 // Handle case when user blur mouse out of input
                 inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                // Handle case when user type anything in input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
        // console.log(selectorRules)
    }
}



// Create method for object (function) Validator
// This method check user was type input?
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

// This method check user was type email?
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            
            return regex.test(value) ? undefined : message || 'Trường này phải nhập email'
        }
    }
    
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
    
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác"

        }
    }
}