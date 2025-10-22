import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';


const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  let params = useParams();
  let id =params.id;
  // Use absolute paths to the Django endpoints to avoid brittle URL math
  let dealer_url = `/djangoapp/dealer/${id}`;
  let review_url = `/djangoapp/add_review`;
  let carmodels_url = `/djangoapp/get_cars`;

  const makes = useMemo(() => Array.from(new Set(carmodels.map(c => c.CarMake))), [carmodels]);
  const modelsForMake = useMemo(() => carmodels.filter(c => c.CarMake === make).map(c => c.CarModel), [carmodels, make]);

  const postreview = async ()=>{
    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if(!make || !model || review === "" || date === "" || year === "") {
      alert("All details are mandatory")
      return;
    }

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make,
      "car_model": model,
      "car_year": year,
    });

    console.log(jsoninput);
    const res = await fetch(review_url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: jsoninput,
  });

  const json = await res.json();
  if (json.status === 200) {
      window.location.href = window.location.origin+"/dealer/"+id;
  }

  }
  const get_dealer = async ()=>{
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(retobj.status === 200) {
      let dealerobjs = Array.from(retobj.dealer)
      if(dealerobjs.length > 0)
        setDealer(dealerobjs[0])
    }
  }

  const get_cars = async ()=>{
    const res = await fetch(carmodels_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    let carmodelsarr = Array.from(retobj.CarModels)
    setCarmodels(carmodelsarr)
  }
  useEffect(() => {
    get_dealer();
    get_cars();
  },[]);


  return (
    <div>
      <Header/>
      <div className="container container-narrow py-4">
        <div className="card card-clean p-4">
          <h3 className="mb-3">Post a Review {dealer?.full_name ? `for ${dealer.full_name}` : ''}</h3>
          <div className="mb-3">
            <label htmlFor='review' className='form-label'>Review</label>
            <textarea id='review' className='form-control' rows='6' onChange={(e) => setReview(e.target.value)}></textarea>
          </div>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Purchase Date</label>
              <input type="date" className='form-control' onChange={(e) => setDate(e.target.value)}/>
            </div>
            <div className='col-md-3'>
              <label className='form-label'>Car Make</label>
              <select className='form-select' value={make} onChange={(e)=> { setMake(e.target.value); setModel(""); }}>
                <option value="" disabled>Choose Make</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className='col-md-3'>
              <label className='form-label'>Car Model</label>
              <select className='form-select' value={model} onChange={(e)=> setModel(e.target.value)} disabled={!make}>
                <option value="" disabled>{make ? 'Choose Model' : 'Select make first'}</option>
                {modelsForMake.map((m, idx) => <option key={`${make}-${m}-${idx}`} value={m}>{m}</option>)}
              </select>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Car Year</label>
              <input type="number" className='form-control' onChange={(e) => setYear(e.target.value)} max={new Date().getFullYear()} min={2015} placeholder='e.g., 2020'/>
            </div>
          </div>
          <div className='d-flex justify-content-end mt-4'>
            <button className='btn btn-brand text-white' onClick={postreview}>Post Review</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PostReview
