import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Імʼя обовʼязкове').min(3, 'Мінімум 3 символи'),
  email: yup.string().required('Email обовʼязковий').email('Невірний формат email'),
  address: yup.string().required('Адреса обовʼязкова').min(5, 'Мінімум 5 символів'),
});

export default function DeliveryForm() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const [suggestions, setSuggestions] = useState([]);

  const onSubmit = (data) => {
    console.log('Дані форми:', data);
  };

  const handleAddressChange = async (e) => {
    const query = e.target.value;

    if (query.length >= 3) {
      try {
        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: 'ВАШ_API_KEY',
            modelName: 'Address',
            calledMethod: 'getSettlements',
            methodProperties: {
              FindByString: query,
              Limit: 5,
            },
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data.map((item) => item.Settlement));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Помилка отримання адрес:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setValue('address', suggestion);
    setSuggestions([]);
  };

  return (
      <div>
        <h1>Форма доставки</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Ім'я:</label>
            <input {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          <div>
            <label>Email:</label>
            <input {...register('email')} />
            {errors.email && <p>{errors.email.message}</p>}
          </div>
          <div>
            <label>Адреса:</label>
            <input {...register('address')} onChange={handleAddressChange} />
            {errors.address && <p>{errors.address.message}</p>}
            <ul>
              {suggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => selectSuggestion(suggestion)}>
                    {suggestion}
                  </li>
              ))}
            </ul>
          </div>
          <button type="submit">Відправити</button>
        </form>
      </div>
  );
}
