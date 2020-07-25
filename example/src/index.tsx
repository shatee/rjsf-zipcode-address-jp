import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import Form, { ISubmitEvent, UiSchema } from '@rjsf/core';
import { ZipcodeAddressJp } from '../../src';
import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  title: 'rjsf-widget-zipcode-address-jp example',
  type: 'object',
  properties: {
    name: {
      title: '名前',
      type: 'string'
    },
    address: {
      title: '住所',
      type: 'string'
    },
    tel: {
      title: '電話番号',
      type: 'string'
    }
  }
};

const widgets = {
  zipcodeAddress: ZipcodeAddressJp
};

const uiSchema: UiSchema = {
  address: {
    'ui:widget': 'zipcodeAddress'
  }
}

const Example = () => {
  const formDataRef = useRef<HTMLTextAreaElement>(null);
  const onSubmit = useCallback((e: ISubmitEvent<any>) => {
    if (formDataRef.current) formDataRef.current.value = JSON.stringify(e.formData, null, '  ');
  }, []);

  return (
    <div>
      <Form schema={schema} widgets={widgets} uiSchema={uiSchema} onSubmit={onSubmit} />
      <hr />
      <div>
        <legend>formData</legend>
        <textarea className="form-control" rows={10} ref={formDataRef} />
      </div>
    </div>
  )
};

ReactDOM.render(
  <Example />
  , document.getElementById('app'));
