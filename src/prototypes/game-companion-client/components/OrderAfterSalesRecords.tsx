export type OrderAfterSalesRecord = {
  id: string
  time: string
  category: '免单' | '提前结束' | '售后'
  amount?: number | null
}

export function OrderAfterSalesRecords({ records }: { records: OrderAfterSalesRecord[] }) {
  return <section className="order-detail-section order-detail-time-section">
    <div className="order-detail-section__heading"><span className="client-eyebrow">售后记录</span></div>
    {records.length === 0 ? <p className="order-detail-empty-record">暂无售后记录</p> : <div className="order-after-sales-table" role="table" aria-label="售后记录">
      <div className="order-after-sales-table__row order-after-sales-table__row--head" role="row">
        <span role="columnheader">时间</span><span role="columnheader">分类</span><span role="columnheader">金额</span>
      </div>
      {records.map(record => <div className="order-after-sales-table__row" role="row" key={record.id}>
        <time role="cell">{record.time || '—'}</time><span role="cell">{record.category}</span><span role="cell">{record.amount == null ? '—' : `${record.amount.toLocaleString()} 钻石`}</span>
      </div>)}
    </div>}
  </section>
}
