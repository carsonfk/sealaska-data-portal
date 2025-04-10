import React, { useState, useEffect } from "react";
//import { getDatabase, ref, set as firebaseSet, push } from 'firebase/database'
//import FilterForm from './FilterForm'

export default function ListFeatures( {mode} ) {
    

    
    if (mode === 'view') {
        return (
            <>
                <div>
                    <h3 id="table-title"></h3>
                    <button>Filter by type</button>
                    <table>
                        <tr>
                            <th></th>
                        </tr>
                    </table>
                </div>
            </>
        )
    }
}