/**
 */
class Validate {
	form = null;
	fields = null;
	rules = [];

	config = {
		submit: function(self, event) {
			event.preventDefault();

			self.clearErrors();
			if (self.validate()) {
				self.form.submit();
			}
		}
	};

	validations = {
		/**
		 */
		required: function(self, value, field, config) {
			let isValid = value !== "";
			if (!isValid) {
				self._setError(field, "Value is required.");
			}
			return isValid;
		},

		/**
		 */
		minlength: function(self, value, field, config) {
			let isValid = value.length >= parseInt(config);
			if (!isValid) {
				self._setError(field, "Length must be at least " + config + " character" + (config === 1 ? "" : "s") + ".");
			}
			return isValid;
		},

		/**
		 */
		maxlength: function(self, value, field, config) {
			let isValid = value.length <= parseInt(config);
			if (!isValid) {
				self._setError(field, "Length must be at most " + config + " character" + (config === 1 ? "" : "s") + ".");
			}
			return isValid;
		},

		/**
		 */
		equalsto: function(self, value, field, config) {
			let otherField = self.form.querySelector(config);
			let otherValue = self._getValue(otherField);

			let isValid = value === otherValue;
			if (!isValid) {
				self._setError(field, "Value is not the same.");
			}
			return isValid;
		},

		/**
		 */
		email: function(self, value, field, config) {
			let isValid = value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
			if (!isValid) {
				self._setError(field, "Value must be an email.");
			}
			return isValid;
		},

		/**
		 */
		digits: function(self, value, field, config) {
			let isValid = value.trim().match(/^[0-9]+$/);
			if (!isValid) {
				self._setError(field, "Value must be digits only.");
			}
			return isValid;
		},

		/**
		 */
		alphanumeric: function(self, value, field, config) {
			let isValid = value.trim().match(/^[0-9a-zA-Z ]+$/);
			if (!isValid) {
				self._setError(field, "Value must be alphanumeric.");
			}
			return isValid;
		},

		/**
		 */
		numeric: function(self, value, field, config) {
			let isValid = value.trim().match(/^-?\d*\.?\d*$/);
			if (!isValid) {
				self._setError(field, "Value must be a number.");
			}
			return isValid;
		},

		/**
		 */
		min: function(self, value, field, config) {
			let isValid = this.numeric(self, value, field, config) && parseInt(value) >= parseInt(config);
			if (!isValid) {
				self._setError(field, "Value must be a greater than " + config + ".");
			}
			return isValid;
		},

		/**
		 */
		max: function(self, value, field, config) {
			let isValid = this.numeric(self, value, field, config) && parseInt(value) <= parseInt(config);
			if (!isValid) {
				self._setError(field, "Value must be a lower than " + config + ".");
			}
			return isValid;
		}
	};

	/**
	 */
	constructor(form, config, validations) {
		this.form = form;
		this.config = this._deepExtend(this.config, config) || this.config;
		this.validations = this._deepExtend(this.validations, validations) || this.validations;

		this.fields = form.querySelectorAll("input,textarea,select");

		if (this.form.tagName === "FORM") {
			this._registerRules();
			this._onSubmit();
		}
	}
	
	/**
	 */
	_deepExtend = function(out, ...arguments_) {
		if (!out) {
			return {};
		}

		for (const obj of arguments_) {
			if (!obj) {
				continue;
			}

			for (const [key, value] of Object.entries(obj)) {
				switch (Object.prototype.toString.call(value)) {
					case '[object Object]':
						out[key] = deepExtend(out[key], value);
						break;
					case '[object Array]':
						out[key] = deepExtend(new Array(value.length), value);
						break;
					default:
						out[key] = value;
				}
			}
		}

		return out;
	}

	/**
	 */
	_setError = function(field, message) {
		// Sets the error labeling
		if (!field.classList.contains("is-invalid")) {
			field.classList.add("is-invalid");
		}

		// Checks if there is an error container
		let parent = field.parentNode;
		let errorContainer = parent.querySelector("div.error-container");
		if (errorContainer === null) {
			errorContainer = document.createElement("div");
			errorContainer.classList.add("error-container");
			parent.insertBefore(errorContainer, field.nextSibling);
		}

		// Inserts the error
		let errorMessage = document.createElement("div");
		errorMessage.classList.add("d-block");
		errorMessage.classList.add("text-danger");
		errorMessage.innerHTML = message;
		errorContainer.append(errorMessage);
	}

	/**
	 */
	_setError = function(field, message) {
		// Sets the error labeling
		if (!field.classList.contains("is-invalid")) {
			field.classList.add("is-invalid");
		}

		// Checks if there is an error container
		let parent = field.parentNode;
		let errorContainer = parent.querySelector("div.error-container");
		if (errorContainer === null) {
			errorContainer = document.createElement("div");
			errorContainer.classList.add("error-container");
			parent.insertBefore(errorContainer, field.nextSibling);
		}

		// Inserts the error
		let errorMessage = document.createElement("div");
		errorMessage.classList.add("d-block");
		errorMessage.classList.add("text-danger");
		errorMessage.innerHTML = message;
		errorContainer.append(errorMessage);
	}

	/**
	 */
	clearErrors = function() {
		for (let r = 0; r < this.rules.length; r++) {
			let rule = this.rules[r];
			let field = rule.field;

			field.classList.remove("is-invalid");
			let errorContainer = field.parentNode.querySelector("div.error-container");
			if (errorContainer !== null) {
				errorContainer.remove();
			}
		}
	}

	/**
	 */
	_registerRules = function() {
		for (let f = 0; f < this.fields.length; f++) {
			let field = this.fields[f];

			// When hidden ignore
			if (field.tagName === "INPUT" && field.getAttribute("type") === "hidden") {
				continue;
			}

			// When doesn't have a name then ignore
			if (!field.hasAttribute("name") || field.getAttribute("name") === "") {
				continue;
			}

			// Obtains the known attributes
			let rules = {};
			let names = Object.keys(this.validations);
			for (let n = 0; n < names.length; n++) {
				let name = names[n];
				if (field.hasAttribute(name)) {
					rules[name] = field.getAttribute(name);
				}
			}

			this.rules.push({
				"field": field,
				"rules": rules
			});
		}

		if (this.rules.length > 0) {
			this.form.setAttribute("novalidate", true);
		}
	}

	/**
	 */
	_onSubmit = function() {
		let self = this;
		this.form.addEventListener("submit", function(event) {
			self.config.submit(self, event);
		});
	}

	/**
	 */
	validate = function() {
		let isValid = true;

		for (let r = 0; r < this.rules.length; r++) {
			let rule = this.rules[r];
			let field = rule.field;
			let rules = rule.rules;

			let names = Object.keys(rules);
			for (let n = 0; n < names.length; n++) {
				let name = names[n];
				let config = rules[name];
				let value = this._getValue(field);

				isValid = this.validations[name](this, value, field, config) && isValid;
			}
		}

		return isValid;
	}

	/**
	 */
	_getValue = function(field) {
		let value = "";
		let tagName = field.tagName;
		switch (tagName) {
			case "INPUT":
				value = field.value;
				break;
			case "SELECT":
				value = field.options[field.selectedIndex].value;
				break;
			case "TEXTAREA":
				value = field.innerHTML;
				break;
		}

		return value;
	}
}