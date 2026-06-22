import React, { useState } from 'react';

const TransactionForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    amount: initialData.amount || '',
    category: initialData.category || 'Food',
    type: initialData.type || 'expense',
    date: initialData.date || new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Food',
    'Shopping',
    'Transport',
    'Housing',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Education',
    'Salary',
    'Electronics',
    'Health',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaction = {
      ...formData,
      id: initialData.id != null ? initialData.id : Date.now(),
      amount: parseFloat(formData.amount),
    };
    onSubmit(transaction);
    
    // Reset form
    if (!initialData.id) {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="input-field pl-7"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field mt-1"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input-field mt-1"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setFormData({
              title: '',
              amount: '',
              category: 'Food',
              type: 'expense',
              date: new Date().toISOString().split('T')[0]
            });
          }}
        >
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData.id ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
