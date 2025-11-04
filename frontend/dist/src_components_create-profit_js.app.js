"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([["src_components_create-profit_js"],{

/***/ "./src/components/create-profit.js":
/*!*****************************************!*\
  !*** ./src/components/create-profit.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CreateProfit: () => (/* binding */ CreateProfit)\n/* harmony export */ });\n/* harmony import */ var _utils_http_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/http-utils */ \"./src/utils/http-utils.js\");\n/* harmony import */ var _utils_localStorage_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/localStorage-utils */ \"./src/utils/localStorage-utils.js\");\n\r\n\r\n\r\nclass CreateProfit {\r\n    url = '/categories/income';\r\n    pageTitle = \"Создание категории дохода\";\r\n\r\n    constructor(openNewRoute) {\r\n        this.openNewRoute = openNewRoute;\r\n        this.pageTitleElement = document.getElementById(\"page-title\");\r\n        this.pageTitleElement.innerText = this.pageTitle;\r\n        this.inputNameCategory = document.getElementById(\"input-name-category\");\r\n        this.buttonEditCategory = document.getElementById(\"button-edit-category\");\r\n        this.buttonSave = document.getElementById(\"button-save\");\r\n\r\n        this.buttonSave.addEventListener('click', this.createCategory.bind(this));\r\n    }\r\n\r\n    validateInput() {\r\n        let isValid = true;\r\n\r\n        if (this.inputNameCategory.value.trim()) {\r\n            this.inputNameCategory.classList.remove('is-invalid');\r\n        } else {\r\n            this.inputNameCategory.classList.add('is-invalid');\r\n            isValid = false;\r\n        }\r\n        return isValid;\r\n    }\r\n\r\n    async createCategory() {\r\n        if (this.validateInput()) {\r\n            const result = await _utils_http_utils__WEBPACK_IMPORTED_MODULE_0__.HttpUtils.request(this.url, 'POST', true,\r\n                {\r\n                    title: this.inputNameCategory.value.trim()\r\n                });\r\n            if (result.error || !result.response) {\r\n                const inputErrorElement = document.getElementById(\"input-name-category-error\");\r\n                inputErrorElement.innerText = 'Ошибка: ' + '(' + result.message + ')';\r\n                this.inputNameCategory.classList.add('is-invalid');\r\n            } else {\r\n                this.inputNameCategory.classList.remove('is-invalid');\r\n                this.openNewRoute('/profit');\r\n            }\r\n        }\r\n    }\r\n}\n\n//# sourceURL=webpack://frontend/./src/components/create-profit.js?\n}");

/***/ }),

/***/ "./src/utils/localStorage-utils.js":
/*!*****************************************!*\
  !*** ./src/utils/localStorage-utils.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   LocalStorageUtils: () => (/* binding */ LocalStorageUtils)\n/* harmony export */ });\nclass LocalStorageUtils {\r\n    static CategoryKey = 'category'\r\n    static OperationKey = 'operation'\r\n\r\n    static async setCategory(value) {\r\n        localStorage.setItem(this.CategoryKey, JSON.stringify(value));\r\n    }\r\n\r\n    static async getCategory() {\r\n        return JSON.parse(localStorage.getItem(this.CategoryKey));\r\n    }\r\n\r\n    static async removeCategory(key) {\r\n        localStorage.removeItem(this.CategoryKey);\r\n    }\r\n\r\n    static setOperation(value){\r\n        localStorage.setItem(this.OperationKey, JSON.stringify(value));\r\n    }\r\n    static getOperation(){\r\n        return JSON.parse(localStorage.getItem(this.OperationKey));\r\n    }\r\n\r\n    static removeOperation(key){\r\n        localStorage.removeItem(this.OperationKey);\r\n    }\r\n}\n\n//# sourceURL=webpack://frontend/./src/utils/localStorage-utils.js?\n}");

/***/ })

}]);