import Link from "next/link";

export default function FormButton (){
    return(
  <Link href='/client-form'>
        <button className="btn ">
            Fill the Form
        </button>
  </Link>
    )
}