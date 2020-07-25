import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Widget, WidgetProps } from '@rjsf/core';
import { ZipcloudAPI } from './ZipcloudAPI';

const stringify = (zipcode: string, ...addresses: string[]) => {
  return `〒${zipcode} ${addresses.map((address) => address.replace(/\s/g, '')).join(' ')}`;
};

const parse = (value: string | undefined): [string, string, string, string, string] => {
  if (typeof value === 'string') {
    const matched = value.match(/^〒(\d{3}-\d{4})(?: ([^\s]+))?(?: ([^\s]+))?(?: ([^\s]+))?(?: (.+))?$/);
    if (matched) return [matched[1], matched[2] ?? '', matched[3] ?? '', matched[4] ?? '', matched[5] ?? ''];
  }
  return ['', '', '', '', ''];
};

export const ZipcodeAddressJp: Widget = (props: WidgetProps) => {
  const { id, value, onBlur, onChange, onFocus } = props;

  const [currentValue, setValue] = useState(value);
  const [zipcodeError, setZipcodeError] = useState<string | null>(null);

  const zipcodeRef = useRef<HTMLInputElement>(null);
  const address1Ref = useRef<HTMLInputElement>(null);
  const address2Ref = useRef<HTMLInputElement>(null);
  const address3Ref = useRef<HTMLInputElement>(null);
  const address4Ref = useRef<HTMLInputElement>(null);

  // input の値が変化したら currentValue を更新する
  const onInputChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !zipcodeRef.current ||
      !address1Ref.current ||
      !address2Ref.current ||
      !address3Ref.current ||
      !address4Ref.current
    )
      return;
    setValue(
      stringify(
        zipcodeRef.current.value,
        address1Ref.current.value,
        address2Ref.current.value,
        address3Ref.current.value,
        address4Ref.current.value,
      ),
    );
  }, []);

  const onZipcodeInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    zipcodeRef.current!.value = event.target.value
      // 全角→半角
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[ー−]/, '-')
      // - を挿入
      .replace(/^(\d{3})(\d+)$/, '$1-$2');
    setZipcodeError(null);
    onInputChange(event);
  }, []);

  const onSearchClick = useCallback(() => {
    if (!zipcodeRef.current) return;
    ZipcloudAPI.search(zipcodeRef.current.value)
      .then((result) => {
        if (!zipcodeRef.current || !address1Ref.current || !address2Ref.current || !address3Ref.current || !address4Ref.current) return;
        address1Ref.current.value = result.address1;
        address2Ref.current.value = result.address2;
        address3Ref.current.value = result.address3;
        address4Ref.current.value = '';
        setValue(stringify(zipcodeRef.current.value, result.address1, result.address2, result.address3));
      })
      .catch((error) => {
        setZipcodeError(error.message ?? 'エラーが発生しました。');
      });
  }, []);

  const onInputBlur = useCallback(() => {
    onBlur(id, currentValue);
  }, [onBlur, id]);

  const onInputFocus = useCallback(
    (_event: React.FocusEvent<HTMLInputElement>) => {
      onFocus(id, currentValue);
    },
    [onFocus, id],
  );

  // value props が変化したら currentValue と input の値を更新する
  useEffect(() => {
    if (value === currentValue) return;
    const [zipcode, address1, address2, address3, address4] = parse(value);
    setValue(value);
    if (zipcodeRef.current) zipcodeRef.current.value = zipcode;
    if (address1Ref.current) address1Ref.current.value = address1;
    if (address2Ref.current) address2Ref.current.value = address2;
    if (address3Ref.current) address3Ref.current.value = address3;
    if (address4Ref.current) address4Ref.current.value = address4;
  }, [value]);

  // currentValue が変化したら onChange に渡す
  useEffect(() => {
    onChange(currentValue);
  }, [currentValue]);

  return (
    <div key={id}>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon1">
            〒
          </span>
        </div>
        <input
          className="form-control"
          ref={zipcodeRef}
          type="tel"
          autoComplete="postal-code"
          pattern="^\d{3}-?\d{2,4}$"
          maxLength={8}
          onChange={onZipcodeInputChange}
          onBlur={onInputBlur}
          onFocus={onInputFocus}
          style={{ maxWidth: '7em' }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={onSearchClick}>
            住所自動入力
          </button>
        </div>
      </div>
      {zipcodeError && <div className="error-detail text-danger">{zipcodeError}</div>}
      <input
        className="form-control mt-2"
        ref={address1Ref}
        autoComplete="address-level1"
        placeholder="都道府県"
        onChange={onInputChange}
        onBlur={onInputBlur}
        onFocus={onInputFocus}
      />
      <input
        className="form-control mt-2"
        ref={address2Ref}
        autoComplete="address-level2"
        placeholder="市区町村"
        onChange={onInputChange}
        onBlur={onInputBlur}
        onFocus={onInputFocus}
      />
      <input
        className="form-control mt-2"
        ref={address3Ref}
        autoComplete="address-line1"
        placeholder="番地・マンション名1"
        onChange={onInputChange}
        onBlur={onInputBlur}
        onFocus={onInputFocus}
      />
      <input
        className="form-control mt-2"
        ref={address4Ref}
        autoComplete="address-line2"
        placeholder="番地・マンション名2"
        onChange={onInputChange}
        onBlur={onInputBlur}
        onFocus={onInputFocus}
      />
    </div>
  );
};
