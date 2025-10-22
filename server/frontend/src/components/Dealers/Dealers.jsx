import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  // let [state, setState] = useState("")
  let [states, setStates] = useState([])

  // Endpoints
  const dealer_url = "/djangoapp/get_dealers";
 
  const filterDealers = async (state) => {
    const url = state === 'All' ? dealer_url : `${dealer_url}/${state}`;
    const res = await fetch(url, {
      method: "GET"
    });
    const retobj = await res.json();
    if(retobj.status === 200) {
      let state_dealers = Array.from(retobj.dealers)
      setDealersList(state_dealers)
    }
  }

  const get_dealers = async ()=>{
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    if(retobj.status === 200) {
      let all_dealers = Array.from(retobj.dealers)
      let states = [];
      all_dealers.forEach((dealer)=>{
        states.push(dealer.state)
      });

      setStates(Array.from(new Set(states)))
      setDealersList(all_dealers)
    }
  }
  useEffect(() => {
    get_dealers();
  },[]);  


let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
    <Header/>
    <div className="container container-narrow py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Dealers</h2>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="state" className="form-label mb-0 me-2">Filter by state</label>
          <select name="state" id="state" className="form-select" style={{minWidth:'180px'}} onChange={(e) => filterDealers(e.target.value)} defaultValue="">
            <option value="" disabled hidden>State</option>
            <option value="All">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive table-clean">
        <table className='table table-striped table-hover align-middle mb-0'>
          <thead className='table-light'>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Dealer Name</th>
              <th scope="col">City</th>
              <th scope="col">Address</th>
              <th scope="col">Zip</th>
              <th scope="col">State</th>
              {isLoggedIn ? (<th scope="col" className='text-center'>Review</th>) : null}
            </tr>
          </thead>
          <tbody>
          {dealersList.length === 0 ? (
            <tr>
              <td colSpan={isLoggedIn ? 7 : 6} className='text-center text-muted py-4'>No dealers found</td>
            </tr>
          ) : dealersList.map(dealer => (
            <tr key={dealer['id']}>
              <td>{dealer['id']}</td>
              <td><a href={'/dealer/'+dealer['id']} className='text-decoration-none'>{dealer['full_name']}</a></td>
              <td>{dealer['city']}</td>
              <td>{dealer['address']}</td>
              <td>{dealer['zip']}</td>
              <td>{dealer['state']}</td>
              {isLoggedIn ? (
                <td className='text-center'>
                  <a href={`/postreview/${dealer['id']}`} className='btn btn-sm btn-outline-primary'>
                    <img src={review_icon} className="review_icon me-1" alt="Post Review"/> Review
                  </a>
                </td>
              ): null}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
}

export default Dealers
