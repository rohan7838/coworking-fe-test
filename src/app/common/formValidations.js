// field names are formatted to avoid exposing backend schema (field names) as the passed field names are same as backend fields.
const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Add space between camel or Pascal case
      .replace(/([A-Z])([A-Z])/g, '$1 $2') // Add space between uppercase letters
      .toLowerCase() // Convert to lowercase
      .replace(/^\w/, (firstLetter) => firstLetter.toUpperCase()); // Capitalize the first letter
  }

export const validateForm = (formData={}, validationSchema={}) => {
    const validationErrors = {};
  
    for (const fieldName in validationSchema) {
      const fieldValue = formData[fieldName];
      const rules = validationSchema[fieldName];
  
      for (const rule of rules) {
        if (rule.required && !fieldValue) {
          const formattedFieldName = formatFieldName(fieldName);
          validationErrors[fieldName] = `${formattedFieldName} is required`;
          break; // break is used to stop checking subsequent rules if current rule fails.
        }
  
        if (rule.minLength && fieldValue.length < rule.minLength) {
          const formattedFieldName = formatFieldName(fieldName);
          validationErrors[fieldName] = `${formattedFieldName} must be at least ${rule.minLength} characters`;
          break;
        }
  
        if (rule.maxLength && fieldValue.length > rule.maxLength) {
          const formattedFieldName = formatFieldName(fieldName);
          validationErrors[fieldName] = `${formattedFieldName} must not exceed ${rule.maxLength} characters`;
          break;
        }
  
        if (rule.pattern && !rule.pattern.test(fieldValue)) {
          const formattedFieldName = formatFieldName(fieldName);
          validationErrors[fieldName] = `Invalid ${formattedFieldName}`;
          break;
        }
      }
    }
  
    return validationErrors;
  }
  

// trim input values (remove spaces before and after the input string)

export const trimInputValues = (data = {}) => {
    let newDataObject = { ...data };

    Object.keys(newDataObject).forEach((key) => {
      if (typeof newDataObject[key] === "string") {
        newDataObject = { ...newDataObject, [key]: newDataObject[key].trim() };
      }
    });
    return newDataObject;
  };

  export const dataWithoutEmptyValues = (data = {}) => {
    let newData = {};

    Object.keys(data)
      .filter((key) => {
        return data[key] !== "" && data[key] !== 0 && data[key]?.length!==0;
      })
      .forEach((key) => {
        newData = {
          ...newData,
          [key]: data[key],
        };
      });
    return newData;
  };