"use client";
import { useEffect, useState } from "react";
// import API from "../lib/api";

export default function Dashboard() {
  const [data, setData] = useState([]);

//   useEffect(()=>{
//     const token = localStorage.getItem("token");
//     API.get("/my-stock", {
//       headers:{Authorization:`Bearer ${token}`}
//     }).then(res=>setData(res.data));
//   },[]);

  return (
    <div>
      <h2>My Inventory</h2>
      <a href="/scan">➕ Add Medicine</a>

      <table>
        {/* {data.map((d,i)=>(
          <tr key={i}>
            <td>{d.brand} f"Stock"</td>
            <td>{d.stock} "Stock"</td>
            <td>{d.price} "Price"</td>
            <td>{d.expiry} "Expiry"</td>
          </tr>
        ))} */}

        <p>Sample Data</p>
        <tr>
          <td>Brand: Dolo/n</td>
          <td>Stock: 100</td>
          <td>Price: $5.99</td>
          <td>Expiry: 2023-12-31</td>
        </tr>

      </table>
    </div>
  );
}