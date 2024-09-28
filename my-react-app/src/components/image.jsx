import style from './css.module.css' ;

export function Images({src}) {
    return (
        <img src={src} alt="" className={style.width}></img>
    );
};