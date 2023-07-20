import React from "react";

function Footer(){
    const year = new Date().getFullYear();
    return <div>
        <footer>
            <p>Made by Ofir Wysboom {year}</p>
        </footer>
    </div>
}

export default Footer;