import { useCallback, useEffect, useRef, useState } from 'react';
import { ComboBox } from '@carbon/react';
import HttpService from '../../../services/HttpService';

interface typeaheadArgs {
  id: string;
  onChange: any;
  options: any;
  value: any;
  schema?: any;
  uiSchema?: any;
  disabled?: boolean;
  readonly?: boolean;
  rawErrors?: any;
  placeholder?: string;
  label?: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function TypeaheadWidget({
  id,
  onChange,
  options: { category, itemFormat },
  value,
  schema,
  uiSchema,
  disabled,
  readonly,
  placeholder,
  label,
  rawErrors = [],
}: typeaheadArgs) {
  const lastSearchTerm = useRef('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const itemFormatRegex = /[^{}]+(?=})/g;

  let itemFormatSubstitutions: string[] | null = null;
  let invalid = false;
  let errorMessageForField = null;

  if (itemFormat) {
    try {
      itemFormatSubstitutions = itemFormat.match(itemFormatRegex);
    } catch (e) {
      errorMessageForField = `itemFormat does not contain replacement keys in curly braces. It should be like: "{key1} ({key2} - {key3})"`;
      invalid = true;
    }
  }

  let labelToUse = label;
  if (uiSchema && uiSchema['ui:title']) {
    labelToUse = uiSchema['ui:title'];
  } else if (schema && schema.title) {
    labelToUse = schema.title;
  }

  if (!category) {
    errorMessageForField = `category is not set in the ui:options for this field: ${labelToUse}`;
    invalid = true;
  }

  const typeaheadSearch = useCallback(
    (inputText: string) => {
      const pathForCategory = (text: string) => {
        return `/connector-proxy/typeahead/${category}?prefix=${text}&limit=100`;
      };
      if (inputText) {
        lastSearchTerm.current = inputText;
        // TODO: check cache of prefixes -> results
        HttpService.makeCallToBackend({
          path: pathForCategory(inputText),
          successCallback: (result: any) => {
            if (lastSearchTerm.current === inputText) {
              setItems(result);
            }
          },
        });
      }
    },
    [category]
  );

  useEffect(() => {
    if (value) {
      setSelectedItem(JSON.parse(value));
      typeaheadSearch(value);
    }
  }, [value, typeaheadSearch]);

  const itemToString = (item: any) => {
    if (!item) {
      return null;
    }

    let str = itemFormat;
    if (itemFormatSubstitutions) {
      itemFormatSubstitutions.forEach((key: string) => {
        str = str.replace(`{${key}}`, item[key]);
      });
    } else {
      str = JSON.stringify(item);
    }
    return str;
  };

  let placeholderText = `Start typing to search...`;
  if (placeholder) {
    placeholderText = placeholder;
  }

  let helperText = null;
  if (uiSchema && uiSchema['ui:help']) {
    helperText = uiSchema['ui:help'];
  }

  if (!invalid && rawErrors && rawErrors.length > 0) {
    invalid = true;
    if ('validationErrorMessage' in schema) {
      errorMessageForField = (schema as any).validationErrorMessage;
    } else {
      errorMessageForField = `${(labelToUse || '').replace(/\*$/, '')} ${
        rawErrors[0]
      }`;
    }
  }

  return (
    <ComboBox
      onInputChange={typeaheadSearch}
      onChange={(event: any) => {
        setSelectedItem(event.selectedItem);
        let valueToUse = event.selectedItem;

        // if the value is not truthy then do not stringify it
        // otherwise things like null becomes "null"
        if (valueToUse) {
          valueToUse = JSON.stringify(valueToUse);
        }

        onChange(valueToUse);
      }}
      id={id}
      items={items}
      itemToString={itemToString}
      placeholder={placeholderText}
      selectedItem={selectedItem}
      helperText={helperText}
      disabled={disabled}
      readOnly={readonly}
      invalid={invalid}
      invalidText={errorMessageForField}
    />
  );
}
