export function PrivacyTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">We store</th>
            <th className="px-4 py-3 font-semibold">We never store</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
          <tr>
            <td className="px-4 py-3">Email, password hash, plan, usage count</td>
            <td className="px-4 py-3">PDFs, Word files, images, extracted text, explanations</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
