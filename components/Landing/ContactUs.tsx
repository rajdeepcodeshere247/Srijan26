import { AnimatedSectionTitle } from "./AnimatedSectionTitle";

type ContactPerson = {
  name: string;
  // position: string;
  phone: string;
};

const contacts: ContactPerson[] = [
  // {
  //   name: "Ankush Agarwala",
  //   position: "Event Team",
  //   phone: "+91 96356 09058",
  // },
  {
    name: "Saumili Ray",
    phone: "+91 73188 09736",
  },
  {
    name: "Shrawtrik Bhattacharjee",
    phone: "+91 82407 93529",
  }
];

export const ContactUs = () => {
  return (
    <>
      <div id="contact-us" className="full-bleed">
        <AnimatedSectionTitle
          text="Contact Us"
          className="text-4xl md:text-5xl lg:text-7xl font-elnath text-yellow ml-10 mb-10 sm:ml-18 lg:ml-24 sm:mb-16 flex justify-start"
        />
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 md:px-16 lg:px-32">
        {contacts.map((person, index) => (
          <li
            key={index}
            className="px-8 py-6 flex flex-row items-center justify-between gap-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300"
          >
            <div>
              <p className="text-lg font-semibold tracking-wide">
                {person.name}
              </p>
              {/* <p className="text-sm text-neutral-400">{person.position}</p> */}
            </div>

            <a
              href={`tel:${person.phone}`}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm md:text-base"
            >
              {person.phone}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
};
