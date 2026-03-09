type ContactPerson = {
  name: string;
  position: string;
  phone: string;
};

const contacts: ContactPerson[] = [
  {
    name: "Ahnik Purkait",
    position: "Jadavpur Campus",
    phone: "+91 8770 98463",
  },
  {
    name: "Rahul Sk.",
    position: "Salt Lake Campus",
    phone: "+91 96354 46867",
  },
];

export default function ContactInfo() {
  return (
    <ul className="divide-y divide-white/10 w-full">
      {contacts.map((person, index) => (
        <li
          key={index}
          className="px-4 py-4 flex flex-row items-center justify-between gap-4 hover:bg-white/5 transition-all duration-300"
        >
          <div className="text-left">
            <p className="text-sm md:text-base font-semibold tracking-wide text-white">
              {person.name}
            </p>
            <p className="text-xs md:text-sm text-neutral-400">{person.position}</p>
          </div>

          <a
            href={`tel:${person.phone}`}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs md:text-sm whitespace-nowrap"
          >
            {person.phone}
          </a>
        </li>
      ))}
    </ul>
  );
}