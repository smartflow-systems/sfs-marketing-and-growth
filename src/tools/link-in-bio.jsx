export default function LinkInBio(){
  const items=[{t:"SmartFlow Systems",u:"https://smartflow.systems"},{t:"Instagram",u:"#"}];
  return (<div className="card"><h3>Link-in-bio Grid</h3>
    <div className="grid">{items.map(x=><a key={x.u} className="card" href={x.u} target="_blank" rel="noreferrer">{x.t}</a>)}</div>
  </div>);
}
