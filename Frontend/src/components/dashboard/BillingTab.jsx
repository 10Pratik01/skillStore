import React from 'react';

const STATUS_STYLE = {
  SUCCESS:  'bg-green-50 text-green-600',
  INVITED:  'bg-blue-50 text-blue-500',
  FAILED:   'bg-red-50 text-red-500',
  PENDING:  'bg-amber-50 text-amber-600',
};

const BillingTab = ({ transactions, courseDetails }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-extrabold text-textMain">Billing History</h2>
      <span className="text-sm text-secondary font-medium">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
    </div>

    {transactions.length === 0 ? (
      <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-soft">
        <div className="text-5xl mb-4">💳</div>
        <h3 className="text-xl font-bold text-textMain mb-2">No transactions yet</h3>
        <p className="text-secondary">Your purchase history will appear here.</p>
      </div>
    ) : (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map(tx => {
              const courseTitle = courseDetails[tx.courseId]?.title || `Course ${tx.courseId}`;
              const style = STATUS_STYLE[tx.status] || 'bg-gray-50 text-gray-500';
              return (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-secondary truncate max-w-[150px]">
                    {tx.transactionId?.slice(0, 16)}…
                  </td>
                  <td className="px-6 py-4 font-semibold text-textMain">{courseTitle}</td>
                  <td className="px-6 py-4 text-secondary">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '–'}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary">
                    {tx.amount === 0 ? <span className="text-green-600">Free</span> : `$${Number(tx.amount).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${style}`}>{tx.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default BillingTab;
