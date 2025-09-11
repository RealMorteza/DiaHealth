import React from 'react'
import './quickaccess.css'
import chart_icon from '../../assets/icon/chart.png';
import pill_icon from '../../assets/icon/pill.png';
import list_icon from '../../assets/icon/list.png';

export const Quickaccess = () => {
    return (
        <div className='quickaccess'>
            <div className="quickaccess-main">
                <p className='quickaccess-text'> دسترسی سریع </p>
                <div class="carousel">
                    <div class="carousel-track">
                        <div class="carousel-item">
                            <img className='chart-icon' src={chart_icon}></img>
                            <h3>کنترل وضعیت </h3>
                            <p> </p>
                        </div>
                        <div class="carousel-item">
                            <img className='pill-icon' src={pill_icon}></img>
                            <h3>دارو های من</h3>
                            <p> </p>
                        </div>
                        <div class="carousel-item">
                            <img className='list-icon' src={list_icon}></img>
                            <h3>برنامه ریزی </h3>
                            <p> </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
