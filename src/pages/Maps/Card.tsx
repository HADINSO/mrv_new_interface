import React, { useEffect } from "react";

const Card: React.FC<CardProps> = ({
    estacion
}) => {

    return (
        <>
            <h1>{estacion.nombre}</h1>
        </>
    );
};

export default Card;
