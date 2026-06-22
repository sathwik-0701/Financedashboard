const Transaction = require('../models/Transaction');

// GET /api/transactions
async function getTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });
    return res.status(200).json({ transactions });
  } catch (err) {
    console.error('[transactions] getTransactions error:', err);
    return res.status(500).json({ message: 'Failed to load transactions.' });
  }
}

// POST /api/transactions
async function createTransaction(req, res) {
  try {
    const { title, amount, category, type, date } = req.body || {};

    if (!title || amount === undefined || !category || !type || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }
    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: numericAmount,
      category,
      type,
      date,
    });

    return res.status(201).json({ transaction });
  } catch (err) {
    console.error('[transactions] createTransaction error:', err);
    return res.status(500).json({ message: 'Failed to create transaction.' });
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, category, type, date } = req.body || {};

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (title !== undefined) transaction.title = title;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be income or expense.' });
      }
      transaction.type = type;
    }
    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
      }
      transaction.amount = numericAmount;
    }

    await transaction.save();
    return res.status(200).json({ transaction });
  } catch (err) {
    console.error('[transactions] updateTransaction error:', err);
    return res.status(500).json({ message: 'Failed to update transaction.' });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }
    return res.status(200).json({ message: 'Transaction deleted.' });
  } catch (err) {
    console.error('[transactions] deleteTransaction error:', err);
    return res.status(500).json({ message: 'Failed to delete transaction.' });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
