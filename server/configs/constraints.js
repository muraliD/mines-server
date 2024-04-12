/**********************************************************************************************************************************************
   * 1.validator declaration for all models and list all attributes in all models here
**********************************************************************************************************************************************/
var constraints = {
    userName: {
        presence: true,
        length: {
            minimum: 4,
            maximum: 15,
            tooShort: 'should have a minimum length of 6',
            tooLong: 'should not be more than 15 characters'
        },
        format: {
            pattern: '^[a-zA-Z0-9]+$',
            message: 'should contain only letters and numbers'
        }

    },
    password: {
        presence: true,
        length: {
            minimum: 8,
            tooShort: 'should have a minimum length of 8'
        }
    },
    email: {
        presence: true,
        email: {
            message: 'is not valid'
        }
    },
    mobileNumber: {
        presence: true,
        length: {
            is: 10,
            wrongLength: 'is not 10 digits'
        },
        format: {
            pattern: '/^[2-9]{1}[0-9]{9}$/',
            message: 'is not valid'
        }
    },
    firstName: {
        presence: true
    },
    lastName: {
        presence: true
    },
    age: {
        presence: true,
        length: {
            is: 2,
            wrongLength: 'is not 2 digits'
        },
        numericality: {
            onlyInteger: true,
            greaterThan: 18,
            lessThanOrEqualTo: 99,
            message: 'should be between 18 and 99'
        }
    },
    gender: {
        presence: true,
        inclusion: {
            within: ['male', 'female'],
            message: "has to be male or female"
        }
    },
    zipcode: {
        presence: true,
        length: {
            is: 5,
            wrongLength: 'is not 5 digits'
        },
        format: {
            pattern: '^[0-9]{5}(-[0-9]{4})?$',
            message: 'is not valid'
        }
    },
    agreeToTerms: {
        presence: true,
        inclusion: {
            within: [true, false],
            message: "has to be true or false"
        }
    },
    eBillVendorCode: {
        presence: true,        
        format: {
            pattern: '^[0-9]+$',
            message: 'should contain only numbers'
        }
    },
    mandatoryField: {
        presence: true
    },
}
/**********************************************************************************************************************************************
   * 2.declare an object for each route and list all of its attributes for validation.use the route name as the key
**********************************************************************************************************************************************/
module.exports = {
    home: {
    },
    getConfig: {
    },
    signIn: {
        email: constraints.email,
        password: constraints.password
    },
    signUp: {
        userName: constraints.userName,
        password: constraints.password,
        confirmPassword: constraints.password,
        email: constraints.email,
        age: constraints.age,
        gender: constraints.gender,
        zipcode: constraints.zipcode,
        agreeToTerms: constraints.agreeToTerms
    },
    validateUserName: {
        userName: constraints.userName
    },
    createjob: {
        eBillVendorCode: constraints.eBillVendorCode,
        eBillVendor: constraints.mandatoryField,
        URL: constraints.mandatoryField,
        Userid: constraints.mandatoryField,
        Password: constraints.mandatoryField,
        reviewedinvoices:constraints.mandatoryField
    }

}
