import { CacheType } from "../reducers";
import { SomeResult, makeError, makeSuccess } from "../typings/AppProviderTypes";

export type PincodeType = {
  Note: string,
  Country: string,
  ISO: string,
  Format: string,
  Regex: string,
}


//Pincodes and regex taken from: https://gist.github.com/jamesbar2/1c677c22df8f21e869cca7e439fc3f5b
export const Pincodes: PincodeType[] = [
  {
  "Note": "The first two digits (ranging from 10–43) correspond to the province, while the last two digits correspond either to the city/delivery zone (range 01–50) or to the district/delivery zone (range 51–99). Afghanistan Postal code lookup",
  "Country": "Afghanistan",
  "ISO": "AF",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "With Finland, first two numbers are 22.",
  "Country": "Åland Islands",
  "ISO": "AX",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Introduced in 2006, gradually implemented throughout 2007.",
  "Country": "Albania",
  "ISO": "AL",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "First two as in ISO 3166-2:DZ",
  "Country": "Algeria",
  "ISO": "DZ",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "U.S. ZIP codes (range 96799)",
  "Country": "American Samoa",
  "ISO": "AS",
  "Format": "NNNNN (optionally NNNNN-NNNN or NNNNN-NNNNNN)",
  "Regex": "^\\d{5}(-{1}\\d{4,6})$"
}, {
  "Note": "Each parish now has its own post code.",
  "Country": "Andorra",
  "ISO": "AD",
  "Format": "CCNNN",
  "Regex": "^[Aa][Dd]\\d{3}$"
}, {
  "Note": "",
  "Country": "Angola",
  "ISO": "AO",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Single code used for all addresses.",
  "Country": "Anguilla",
  "ISO": "AI",
  "Format": "AI-2640",
  "Regex": "^[Aa][I][-][2][6][4][0]$"
}, {
  "Note": "",
  "Country": "Antigua and Barbuda",
  "ISO": "AG",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Codigo Postal Argentino (CPA), where the first A is the province code as in ISO 3166-2:AR, the four numbers are the old postal codes, the three last letters indicate a side of the block. Previously NNNN which &#10;o the minimum requirement as of 2006.",
  "Country": "Argentina",
  "ISO": "AR",
  "Format": "1974-1998 NNNN; From 1999 ANNNNAAA",
  "Regex": "^\\d{4}|[A-Za-z]\\d{4}[a-zA-Z]{3}$"
}, {
  "Note": "Previously used NNNNNN system inherited from former Soviet Union.",
  "Country": "Armenia",
  "ISO": "AM",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Aruba",
  "ISO": "AW",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Single code used for all addresses. Part of UK system.",
  "Country": "Ascension island",
  "ISO": "AC",
  "Format": "AAAANAA one code: ASCN 1ZZ",
  "Regex": "^[Aa][Ss][Cc][Nn]\\s{0,1}[1][Zz][Zz]$"
}, {
  "Note": "In general, the first digit identifies the state or territory.",
  "Country": "Australia",
  "ISO": "AU",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "The first digit denotes regions, which are partly identical to one of the nine provinces—called Bundesländer; the last the nearest post office in the area.",
  "Country": "Austria",
  "ISO": "AT",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Previously used NNNNNN system inherited from former Soviet Union.",
  "Country": "Azerbaijan",
  "ISO": "AZ",
  "Format": "CCNNNN",
  "Regex": "^[Aa][Zz]\\d{4}$"
}, {
  "Note": "",
  "Country": "Bahamas",
  "ISO": "BS",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Valid post code numbers are 101 to 1216 with gaps in the range. Known as block number (Arabic: رقم المجمع‎) formally. The first digit in NNN format and the first two digits in NNNN format refer to one of the 12 municipalities of the country. PO Box address doesn't need a block number or city name, just the PO Box number followed by the name of the country, Bahrain.",
  "Country": "Bahrain",
  "ISO": "BH",
  "Format": "NNN or NNNN",
  "Regex": "^\\d{3,4}$"
}, {
  "Note": "",
  "Country": "Bangladesh",
  "ISO": "BD",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Only one postal code currently assigned. 11000 applies to the General Post Office building in Cheapside, Bridgetown, to enable delivery to Barbados by global package delivery companies whose software requires a postal code.",
  "Country": "Barbados",
  "ISO": "BB",
  "Format": "CCNNNNN",
  "Regex": "^[Aa][Zz]\\d{5}$"
}, {
  "Note": "Retained system inherited from former Soviet Union.",
  "Country": "Belarus",
  "ISO": "BY",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "In general, the first digit gives the province.",
  "Country": "Belgium",
  "ISO": "BE",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Belize",
  "ISO": "BZ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Benin",
  "ISO": "BJ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "AA NN for street addresses, AA AA for P.O. Box addresses. The second half of the postcode identifies the street delivery walk (e.g.: Hamilton HM 12) or the PO Box number range (e.g.: Hamilton HM BX). See Postal codes in Bermuda.",
  "Country": "Bermuda",
  "ISO": "BM",
  "Format": "AA NN or AA AA",
  "Regex": "^[A-Za-z]{2}\\s([A-Za-z]{2}|\\d{2})$"
}, {
  "Note": "",
  "Country": "Bhutan",
  "ISO": "BT",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Bolivia",
  "ISO": "BO",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Bonaire, Sint Eustatius and Saba",
  "ISO": "BQ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Bosnia and Herzegovina",
  "ISO": "BA",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Botswana",
  "ISO": "BW",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Código de Endereçamento Postal (CEP): -000 to -899 are used for streets, roads, avenues, boulevards; -900 to -959 are used for buildings with a high postal use; -960 to -969 are for promotional use; -970 to -989 are post offices and regular P.O. boxes; and -990 to -998 are used for community P.O. boxes. -999 is used for special services.",
  "Country": "Brazil",
  "ISO": "BR",
  "Format": "NNNNN-NNN (NNNNN from 1971 to 1992)",
  "Regex": "^\\d{5}-\\d{3}$"
}, {
  "Note": "Single code used for all addresses.",
  "Country": "British Antarctic Territory",
  "ISO": "",
  "Format": "BIQQ 1ZZ",
  "Regex": "^[Bb][Ii][Qq]{2}\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "UK territory, but not UK postcode.",
  "Country": "British Indian Ocean Territory",
  "ISO": "IO",
  "Format": "AAAANAA one code: BBND 1ZZ",
  "Regex": "^[Bb]{2}[Nn][Dd]\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "Specifically, VG1110 through VG1160[1]",
  "Country": "British Virgin Islands",
  "ISO": "VG",
  "Format": "CCNNNN",
  "Regex": "^[Vv][Gg]\\d{4}$"
}, {
  "Note": "",
  "Country": "Brunei",
  "ISO": "BN",
  "Format": "AANNNN",
  "Regex": "^[A-Za-z]{2}\\d{4}$"
}, {
  "Note": "",
  "Country": "Bulgaria",
  "ISO": "BG",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Burkina Faso",
  "ISO": "BF",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Burundi",
  "ISO": "BI",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Cambodia",
  "ISO": "KH",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Cameroon",
  "ISO": "CM",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "The system was gradually introduced starting in April 1971 in Ottawa. The letters D, F, I, O, Q, and U are not used to avoid confusion with other letters or numbers.",
  "Country": "Canada",
  "ISO": "CA",
  "Format": "ANA NAN",
  "Regex": "^(?=[^DdFfIiOoQqUu\\d\\s])[A-Za-z]\\d(?=[^DdFfIiOoQqUu\\d\\s])[A-Za-z]\\s{0,1}\\d(?=[^DdFfIiOoQqUu\\d\\s])[A-Za-z]\\d$"
}, {
  "Note": "The first digit indicates the island.",
  "Country": "Cape Verde",
  "ISO": "CV",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Cayman Islands",
  "ISO": "KY",
  "Format": "CCN-NNNN",
  "Regex": "^[Kk][Yy]\\d[-\\s]{0,1}\\d{4}$"
}, {
  "Note": "",
  "Country": "Central African Republic",
  "ISO": "CF",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Chad",
  "ISO": "TD",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "May only be required for bulk mail.",
  "Country": "Chile",
  "ISO": "CL",
  "Format": "NNNNNNN (NNN-NNNN)",
  "Regex": "^\\d{7}\\s\\(\\d{3}-\\d{4}\\)$"
}, {
  "Note": "A postal code or youbian (邮编) in a subordinate division will have the same first two digits as its governing one (see Political divisions of China. The postal services in Macau or Hong Kong Special Administrative Regions remain separate from Mainland China, with no post code system currently used.",
  "Country": "China",
  "ISO": "CN",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Part of the Australian postal code system.",
  "Country": "Christmas Island",
  "ISO": "CX",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Part of the Australian postal code system.",
  "Country": "Cocos (Keeling) Island",
  "ISO": "CC",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "First NN = 32 departments Códigos Postales | 4-72",
  "Country": "Colombia",
  "ISO": "CO",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "",
  "Country": "Comoros",
  "ISO": "KM",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Congo (Brazzaville)",
  "ISO": "CG",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Congo, Democratic Republic",
  "ISO": "CD",
  "Format": "- no codes -",
  "Regex": "^[Cc][Dd]$"
}, {
  "Note": "",
  "Country": "Cook Islands",
  "ISO": "CK",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "First codes the provinces, next two the canton, last two the district.",
  "Country": "Costa Rica",
  "ISO": "CR",
  "Format": "NNNNN (NNNN until 2007)",
  "Regex": "^\\d{4,5}$"
}, {
  "Note": "",
  "Country": "Côte d'Ivoire (Ivory Coast)",
  "ISO": "CI",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Croatia",
  "ISO": "HR",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "May only be required for bulk mail. The letters CP are frequently used before the postal code. This is not a country code, but an abbreviation for \"codigo postal\" or postal code.",
  "Country": "Cuba",
  "ISO": "CU",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Curaçao",
  "ISO": "CW",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Post code system covers whole island, but not used in Northern Cyprus where 'Mersin 10, Turkey' is used instead.",
  "Country": "Cyprus",
  "ISO": "CY",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "With Slovak Republic, Poštovní směrovací číslo (PSČ) - postal routing number.",
  "Country": "Czech Republic",
  "ISO": "CZ",
  "Format": "NNNNN (NNN NN)",
  "Regex": "^\\d{5}\\s\\(\\d{3}\\s\\d{2}\\)$"
}, {
  "Note": "Numbering follows the dispatch of postal trains from Copenhagen.[3] Also used by Greenland, e.g.: DK-3900 Nuuk.",
  "Country": "Denmark",
  "ISO": "DK",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Djibouti",
  "ISO": "DJ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Dominica",
  "ISO": "DM",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Dominican Republic",
  "ISO": "DO",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "No postal code system in use since Indonesian withdrawal in 1999.",
  "Country": "East Timor",
  "ISO": "TL",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Ecuador",
  "ISO": "EC",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Used for all inbound mail to El Salvador. The postal office then distributes the mail internally depending on their destination.",
  "Country": "El Salvador",
  "ISO": "SV",
  "Format": "1101",
  "Regex": "^1101$"
}, {
  "Note": "",
  "Country": "Egypt",
  "ISO": "EG",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Equatorial Guinea",
  "ISO": "GQ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Eritrea",
  "ISO": "ER",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Estonia",
  "ISO": "EE",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The code is only used on a trial basis for Addis Ababa addresses.",
  "Country": "Ethiopia",
  "ISO": "ET",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "UK territory, but not UK postcode",
  "Country": "Falkland Islands",
  "ISO": "FK",
  "Format": "AAAANAA one code: FIQQ 1ZZ",
  "Regex": "^[Ff][Ii][Qq]{2}\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "Self-governing territory within the Kingdom of Denmark, but not Danish postcode.",
  "Country": "Faroe Islands",
  "ISO": "FO",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "",
  "Country": "Fiji",
  "ISO": "FJ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "A lower first digit indicates a place in south (for example 00100 Helsinki), a higher indicates a place further to north (99800 in Ivalo). The last digit is usually 0, except for postal codes for PO Box number ranges, in which case it is 1. Country code for Finland: \"FI\". In the Åland Islands, the postal code is prefixed with \"AX\", not \"FI\". Some postal codes for rural settlements may end with 5, and there are some unique postal codes for large companies and institutions, e.g. 00014 HELSINGIN YLIOPISTO (university), 00102 EDUSKUNTA (parliament), 00020 NORDEA (a major Scandinavian bank).",
  "Country": "Finland",
  "ISO": "FI",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The first two digits give the département number, while in Paris, Lyon and Marseille, the last two digits of the postal code indicates the arrondissement. Both of the 2 corsican départements use \"20\" as the first two digits. Also used by French overseas departments and territories. Monaco is also part of the French postal code system, but the country code MC- is used for Monegasque addresses.",
  "Country": "France",
  "ISO": "FR",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Overseas Department of France. French codes used. Range 97300 - 97390.",
  "Country": "French Guiana",
  "ISO": "GF",
  "Format": "973NN",
  "Regex": "^973\\d{2}$"
}, {
  "Note": "Overseas Department of France. French codes used. Range 98700 - 98790.",
  "Country": "French Polynesia",
  "ISO": "PF",
  "Format": "987NN",
  "Regex": "^987\\d{2}$"
}, {
  "Note": "French codes in the 98400 range have been reserved.",
  "Country": "French Southern and Antarctic Territories",
  "ISO": "TF",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Two digit postal zone goes after city name.",
  "Country": "Gabon",
  "ISO": "GA",
  "Format": "NN [city name] NN",
  "Regex": "^\\d{2}\\s[a-zA-Z-_ ]\\s\\d{2}$"
}, {
  "Note": "",
  "Country": "Gambia",
  "ISO": "GM",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Georgia",
  "ISO": "GE",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Postleitzahl (PLZ)",
  "Country": "Germany",
  "ISO": "DE",
  "Format": "NN",
  "Regex": "^\\d{2}$"
}, {
  "Note": "Postleitzahl (PLZ)",
  "Country": "Germany",
  "ISO": "DE",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Postleitzahl (PLZ), introduced after the German reunification. Between 1989 and 1993 the old separate 4-digit postal codes of former West- and East-Germany were distinguished by preceding \"W-\" or \"O-\" ('Ost' for East).",
  "Country": "Germany",
  "ISO": "DE",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "[citation needed]",
  "Country": "Ghana",
  "ISO": "GH",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Single code used for all addresses.",
  "Country": "Gibraltar",
  "ISO": "GI",
  "Format": "GX11 1AA",
  "Regex": "^[Gg][Xx][1]{2}\\s{0,1}[1][Aa]{2}$"
}, {
  "Note": "",
  "Country": "Greece",
  "ISO": "GR",
  "Format": "NNN NN",
  "Regex": "^\\d{3}\\s{0,1}\\d{2}$"
}, {
  "Note": "Part of the Danish postal code system.",
  "Country": "Greenland",
  "ISO": "GL",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Grenada",
  "ISO": "GD",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Overseas Department of France. French codes used. Range 97100 - 97190.",
  "Country": "Guadeloupe",
  "ISO": "GP",
  "Format": "971NN",
  "Regex": "^971\\d{2}$"
}, {
  "Note": "U.S. ZIP codes. Range 96910 - 96932.",
  "Country": "Guam",
  "ISO": "GU",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The first two numbers identify the department, the third number the route and the last two the office.",
  "Country": "Guatemala",
  "ISO": "GT",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "UK-format postcode (first two letters are always GY not GG)",
  "Country": "Guernsey",
  "ISO": "GG",
  "Format": "AAN NAA, AANN NAA",
  "Regex": "^[A-Za-z]{2}\\d\\s{0,1}\\d[A-Za-z]{2}$"
}, {
  "Note": "",
  "Country": "Guinea",
  "ISO": "GN",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Guinea Bissau",
  "ISO": "GW",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Guyana",
  "ISO": "GY",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Haiti",
  "ISO": "HT",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Part of the Australian postcode system.",
  "Country": "Heard and McDonald Islands",
  "ISO": "HM",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Honduras",
  "ISO": "HN",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "[1] The dummy postal code of Hong Kong is 999077 but it is unnecessary in fact",
  "Country": "Hong Kong",
  "ISO": "HK",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "The code defines an area, usually one code per settlement except the six largest towns. One code can identify more (usually) small settlements as well.",
  "Country": "Hungary",
  "ISO": "HU",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Iceland",
  "ISO": "IS",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "Postal Index Number (PIN)",
  "Country": "India",
  "ISO": "IN",
  "Format": "NNNNNN,&#10;NNN NNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Kode Pos. Included East Timor (ranges 88xxx and 89xxx) until 1999, no longer used. For Indonesia postal code information visit [2]",
  "Country": "Indonesia",
  "ISO": "ID",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "(Persian: کد پستی)",
  "Country": "Iran",
  "ISO": "IR",
  "Format": "NNNNN-NNNNN",
  "Regex": "^\\d{5}-\\d{5}$"
}, {
  "Note": "",
  "Country": "Iraq",
  "ISO": "IQ",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Currently no postal codes; however, Dublin is divided into postal districts on syntax Dublin 9. A national post code system is planned. See also Republic of Ireland postal addresses.",
  "Country": "Ireland",
  "ISO": "IE",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "UK-format postcode. The first two letters are always IM.",
  "Country": "Isle of Man",
  "ISO": "IM",
  "Format": "CCN NAA, CCNN NAA",
  "Regex": "^[Ii[Mm]\\d{1,2}\\s\\d\\[A-Z]{2}$"
}, {
  "Note": "Postcode is always written BEFORE the city/place name, i.e. to the Right in Hebrew or Arabic script - to the Left in Latin script.  This also allows the legacy postal code version (even though deprecated) since it's still in high use.",
  "Country": "Israel",
  "ISO": "IL",
  "Format": "NNNNNNN, NNNNN",
  "Regex": "^\\b\\d{5}(\\d{2})?$"
}, {
  "Note": "Codice di Avviamento Postale (CAP). Also used by San Marino and Vatican City. First two digits identify province with some exceptions, because there are more than 100 provinces.",
  "Country": "Italy",
  "ISO": "IT",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Jamaica currently has no national postal code system, except for Kingston and Lower St. Andrew, which are divided into postal districts numbered 1-20[4] &#10;Before the 2007 suspension, the first two letters of a national post code were always 'JM' (for Jamaica) while the third was for one of the four zones (A-D) into which the island was divided. The last two letters were for the parish, while the two digits were for the local post office.[5]",
  "Country": "Jamaica",
  "ISO": "JM",
  "Format": "Before suspension: CCAAANN &#10;After suspension: NN",
  "Regex": "^\\d{2}$"
}, {
  "Note": "See also Japanese addressing system.",
  "Country": "Japan",
  "ISO": "JP",
  "Format": "NNNNNNN (NNN-NNNN)",
  "Regex": "^\\d{7}\\s\\(\\d{3}-\\d{4}\\)$"
}, {
  "Note": "UK-format postcode.",
  "Country": "Jersey",
  "ISO": "JE",
  "Format": "CCN NAA",
  "Regex": "^[Jj][Ee]\\d\\s{0,1}\\d[A-Za-z]{2}$"
}, {
  "Note": "Deliveries to PO Boxes only.",
  "Country": "Jordan",
  "ISO": "JO",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "[6]",
  "Country": "Kazakhstan",
  "ISO": "KZ",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Deliveries to PO Boxes only. The postal code refers to the post office at which the receiver's P. O. Box is located.",
  "Country": "Kenya",
  "ISO": "KE",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Kiribati",
  "ISO": "KI",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Korea, North",
  "ISO": "KP",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Korea, South",
  "ISO": "KR",
  "Format": "NNNNNN (NNN-NNN)(1988~2015)",
  "Regex": "^\\d{6}\\s\\(\\d{3}-\\d{3}\\)$"
}, {
  "Note": "A separate postal code for Kosovo was introduced by the UNMIK postal administration in 2004. Serbian postcodes are still widely used in the Serbian enclaves. No country code has been assigned.",
  "Country": "Kosovo",
  "ISO": "XK",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The first two digits represent the sector and the last three digits represents the post office.",
  "Country": "Kuwait",
  "ISO": "KW",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Kyrgyzstan",
  "ISO": "KG",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "",
  "Country": "Latvia",
  "ISO": "LV",
  "Format": "LV-NNNN",
  "Regex": "^[Ll][Vv][- ]{0,1}\\d{4}$"
}, {
  "Note": "",
  "Country": "Laos",
  "ISO": "LA",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The first four digits represent the region or postal zone,the last four digits represent the building see also Lebanon Postal code website.",
  "Country": "Lebanon",
  "ISO": "LB",
  "Format": "NNNN NNNN",
  "Regex": "^\\d{4}\\s{0,1}\\d{4}$"
}, {
  "Note": "",
  "Country": "Lesotho",
  "ISO": "LS",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "Two digit postal zone after city name.",
  "Country": "Liberia",
  "ISO": "LR",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Libya",
  "ISO": "LY",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "With Switzerland, ordered from west to east. Range 9485 - 9498.",
  "Country": "Liechtenstein",
  "ISO": "LI",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "References: http://www.post.lt/en/help/postal-code-search. Previously 9999 which was actually the old Soviet 999999 format code with the first 2 digits dropped.",
  "Country": "Lithuania",
  "ISO": "LT",
  "Format": "LT-NNNNN",
  "Regex": "^[Ll][Tt][- ]{0,1}\\d{5}$"
}, {
  "Note": "References: http://www.upu.int/post_code/en/countries/LUX.pdf",
  "Country": "Luxembourg",
  "ISO": "LU",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "[2]",
  "Country": "Macau",
  "ISO": "MO",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Macedonia",
  "ISO": "MK",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Madagascar",
  "ISO": "MG",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "",
  "Country": "Malawi",
  "ISO": "MW",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Maldives",
  "ISO": "MV",
  "Format": "NNNN, NNNNN",
  "Regex": "^\\d{4,5}$"
}, {
  "Note": "",
  "Country": "Malaysia",
  "ISO": "MY",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Mali",
  "ISO": "ML",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Kodiċi Postali",
  "Country": "Malta",
  "ISO": "MT",
  "Format": "AAANNNN (AAA NNNN)",
  "Regex": "^[A-Za-z]{3}\\s{0,1}\\d{4}$"
}, {
  "Note": "U.S. ZIP codes. Range 96960 - 96970.",
  "Country": "Marshall Islands",
  "ISO": "MH",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Mauritania",
  "ISO": "MR",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Mauritius",
  "ISO": "MU",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Overseas Department of France. French codes used. Range 97200 - 97290.",
  "Country": "Martinique",
  "ISO": "MQ",
  "Format": "972NN",
  "Regex": "^972\\d{2}$"
}, {
  "Note": "Overseas Department of France. French codes used. Range 97600 - 97690.",
  "Country": "Mayotte",
  "ISO": "YT",
  "Format": "976NN",
  "Regex": "^976\\d{2}$"
}, {
  "Note": "US ZIP Code. Range 96941 - 96944.",
  "Country": "Micronesia",
  "ISO": "FM",
  "Format": "NNNNN or NNNNN-NNNN",
  "Regex": "^\\d{5}(-{1}\\d{4})$"
}, {
  "Note": "The first two digits identify the state (or a part thereof), except for Nos. 00 to 16, which indicate delegaciones (boroughs) of the Federal District (Mexico City).",
  "Country": "Mexico",
  "ISO": "MX",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "U.S. ZIP codes. Range 96941 - 96944.",
  "Country": "Micronesia",
  "ISO": "FM",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Moldova",
  "ISO": "MD",
  "Format": "CCNNNN (CC-NNNN)",
  "Regex": "^[Mm][Dd][- ]{0,1}\\d{4}$"
}, {
  "Note": "Uses the French Postal System, but with an \"MC\" Prefix for Monaco.",
  "Country": "Monaco",
  "ISO": "MC",
  "Format": "980NN",
  "Regex": "^980\\d{2}$"
}, {
  "Note": "First digit: region / zone&#10;Second digit: province / district&#10;Last three digits: locality / delivery block[7]",
  "Country": "Mongolia",
  "ISO": "MN",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Montenegro",
  "ISO": "ME",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Montserrat",
  "ISO": "MS",
  "Format": "MSR 1110-1350",
  "Regex": "^[Mm][Ss][Rr]\\s{0,1}\\d{4}$"
}, {
  "Note": "",
  "Country": "Morocco",
  "ISO": "MA",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Mozambique",
  "ISO": "MZ",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Myanmar",
  "ISO": "MM",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Postal Code ranges from 9000-9299 (NOTE: mainly 9000 is used)",
  "Country": "Namibia",
  "ISO": "NA",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Nauru",
  "ISO": "NR",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Nepal",
  "ISO": "NP",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "The combination of the postcode and the housenumber gives a unique identifier of the address.",
  "Country": "Netherlands",
  "ISO": "NL",
  "Format": "NNNN AA",
  "Regex": "^\\d{4}\\s{0,1}[A-Za-z]{2}$"
}, {
  "Note": "Overseas Department of France. French codes used. Range 98800 - 98890.",
  "Country": "New Caledonia",
  "ISO": "NC",
  "Format": "988NN",
  "Regex": "^988\\d{2}$"
}, {
  "Note": "Postcodes were originally intended for bulk mailing and were not needed for addressing individual items. However, new post codes for general use were phased in from June 2006 and came into force by July 2008.",
  "Country": "New Zealand",
  "ISO": "NZ",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Nicaragua",
  "ISO": "NI",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Niger",
  "ISO": "NE",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Nigeria",
  "ISO": "NG",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "",
  "Country": "Niue",
  "ISO": "NU",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Part of the Australian postal code system.",
  "Country": "Norfolk Island",
  "ISO": "NF",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "U.S. ZIP codes. Range 96950 - 96952.",
  "Country": "Northern Mariana Islands",
  "ISO": "MP",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "From south to north",
  "Country": "Norway",
  "ISO": "NO",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Deliveries to P.O. Boxes only.",
  "Country": "Oman",
  "ISO": "OM",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "Pakistan postal codes list",
  "Country": "Pakistan",
  "ISO": "PK",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "U.S. ZIP codes. All locations 96940.",
  "Country": "Palau",
  "ISO": "PW",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Panama",
  "ISO": "PA",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "",
  "Country": "Papua New Guinea",
  "ISO": "PG",
  "Format": "NNN",
  "Regex": "^\\d{3}$"
}, {
  "Note": "",
  "Country": "Paraguay",
  "ISO": "PY",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Peru",
  "ISO": "PE",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Philippines",
  "ISO": "PH",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "UK territory, but not UK postcode",
  "Country": "Pitcairn Islands",
  "ISO": "PN",
  "Format": "AAAANAA one code: PCRN 1ZZ",
  "Regex": "^[Pp][Cc][Rr][Nn]\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "",
  "Country": "Poland",
  "ISO": "PL",
  "Format": "NNNNN (NN-NNN)",
  "Regex": "^\\d{2}[- ]{0,1}\\d{3}$"
}, {
  "Note": "",
  "Country": "Portugal",
  "ISO": "PT",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "",
  "Country": "Portugal",
  "ISO": "PT",
  "Format": "NNNN-NNN (NNNN NNN)",
  "Regex": "^\\d{4}[- ]{0,1}\\d{3}$"
}, {
  "Note": "U.S. ZIP codes. ZIP codes 006XX for NW PR, 007XX for SE PR, in which XX designates the town or post office and 009XX for the San Juan Metropolitan Area, in which XX designates the area or borough of San Juan. The last four digits identify an area within the post office. For example 00716-2604: 00716-for the east section of the city of Ponce and 2604 for Aceitillo St. in the neighborhood of Los Caobos. US Post office is changing the PR address format to the American one: 1234 No Name Avenue, San Juan, PR 00901.",
  "Country": "Puerto Rico",
  "ISO": "PR",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Qatar",
  "ISO": "QA",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Overseas Department of France. French codes used. Range 97400 - 97490.",
  "Country": "Réunion",
  "ISO": "RE",
  "Format": "974NN",
  "Regex": "^974\\d{2}$"
}, {
  "Note": "Previously 99999 in Bucharest and 9999 in rest of country.",
  "Country": "Romania",
  "ISO": "RO",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Placed on a line of its own.",
  "Country": "Russia",
  "ISO": "RU",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Overseas Collectivity of France. French codes used.",
  "Country": "Saint Barthélemy",
  "ISO": "BL",
  "Format": "97133",
  "Regex": "^97133$"
}, {
  "Note": "Single code used for all addresses.",
  "Country": "Saint Helena",
  "ISO": "SH",
  "Format": "STHL 1ZZ",
  "Regex": "^[Ss][Tt][Hh][Ll]\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "",
  "Country": "Saint Kitts and Nevis",
  "ISO": "KN",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Saint Lucia",
  "ISO": "LC",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Overseas Collectivity of France. French codes used.",
  "Country": "Saint Martin",
  "ISO": "MF",
  "Format": "97150",
  "Regex": "^97150$"
}, {
  "Note": "Overseas Collectivity of France. French codes used.",
  "Country": "Saint Pierre and Miquelon",
  "ISO": "PM",
  "Format": "97500",
  "Regex": "^97500$"
}, {
  "Note": "",
  "Country": "Saint Vincent and the Grenadines",
  "ISO": "VC",
  "Format": "CCNNNN",
  "Regex": "^[Vv][Cc]\\d{4}$"
}, {
  "Note": "With Italy, uses a five-digit numeric CAP of Emilia Romagna. Range 47890 and 47899",
  "Country": "San Marino",
  "ISO": "SM",
  "Format": "4789N",
  "Regex": "^4789\\d$"
}, {
  "Note": "",
  "Country": "Sao Tome and Principe",
  "ISO": "ST",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "A complete 13-digit code has 5-digit number representing region, sector, city, and zone; 4-digit X between 2000 and 5999; 4-digit Y between 6000 and 9999 [3]. Digits of 5-digit code may represent postal region, sector, branch, section, and block respectively [4].",
  "Country": "Saudi Arabia",
  "ISO": "SA",
  "Format": "NNNNN for PO Boxes. NNNNN-NNNN for home delivery.",
  "Regex": "^\\d{5}(-{1}\\d{4})?$"
}, {
  "Note": "The letters CP or C.P. are often written in front of the postcode. This is not a country code, but simply an abbreviation for \"code postal\".",
  "Country": "Senegal",
  "ISO": "SN",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Poštanski adresni kod (PAK)",
  "Country": "Serbia",
  "ISO": "RS",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Serbia",
  "ISO": "RS",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Seychelles",
  "ISO": "SC",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Sint Maarten",
  "ISO": "SX",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Sierra Leone",
  "ISO": "SL",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Singapore",
  "ISO": "SG",
  "Format": "NN",
  "Regex": "^\\d{2}$"
}, {
  "Note": "",
  "Country": "Singapore",
  "ISO": "SG",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Each building has its own unique postcode.",
  "Country": "Singapore",
  "ISO": "SG",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "with Czech Republic from west to east, Poštové smerovacie číslo (PSČ) - postal routing number.",
  "Country": "Slovakia",
  "ISO": "SK",
  "Format": "NNNNN (NNN NN)",
  "Regex": "^\\d{5}\\s\\(\\d{3}\\s\\d{2}\\)$"
}, {
  "Note": "",
  "Country": "Slovenia",
  "ISO": "SI",
  "Format": "NNNN (CC-NNNN)",
  "Regex": "^([Ss][Ii][- ]{0,1}){0,1}\\d{4}$"
}, {
  "Note": "",
  "Country": "Solomon Islands",
  "ISO": "SB",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "A 5 digit code has been publicized, but never taken into use.",
  "Country": "Somalia",
  "ISO": "SO",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Postal codes are allocated to individual Post Office branches, some have two codes to differentiate between P.O. Boxes and street delivery addresses. Included Namibia (ranges 9000-9299) until 1992, no longer used.",
  "Country": "South Africa",
  "ISO": "ZA",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "One code for all addresses.",
  "Country": "South Georgia and the South Sandwich Islands",
  "ISO": "GS",
  "Format": "SIQQ 1ZZ",
  "Regex": "^[Ss][Ii][Qq]{2}\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "",
  "Country": "South Korea",
  "ISO": "KR",
  "Format": "NNNNNN (NNN-NNN)",
  "Regex": "^\\d{6}\\s\\(\\d{3}-\\d{3}\\)$"
}, {
  "Note": "First two indicate the province, range 01-52",
  "Country": "Spain",
  "ISO": "ES",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Reference: http://mohanjith.net/ZIPLook/ Incorporates Colombo postal districts, e.g.: Colombo 1 is \"00100\". You can search for specific postal codes here.",
  "Country": "Sri Lanka",
  "ISO": "LK",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Sudan",
  "ISO": "SD",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Suriname",
  "ISO": "SR",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "The letter identifies one of the country's four districts.",
  "Country": "Swaziland",
  "ISO": "SZ",
  "Format": "ANNN",
  "Regex": "^[A-Za-z]\\d{3}$"
}, {
  "Note": "",
  "Country": "Sweden",
  "ISO": "SE",
  "Format": "NNNNN (NNN NN)",
  "Regex": "^\\d{3}\\s*\\d{2}$"
}, {
  "Note": "With Liechtenstein, ordered from west to east. In Geneva and other big cities, like Basel, Bern, Zurich, there may be one or two digits after the name of the city when the generic City code (1211) is used instead of the area-specific code (1201, 1202...), e.g.: 1211 Geneva 13. The digit identifies the post office. This addressing is generally used for P.O. box deliveries.",
  "Country": "Switzerland",
  "ISO": "CH",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "Norway postal codes",
  "Country": "Svalbard and Jan Mayen",
  "ISO": "SJ",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "A 4-digit system has been announced. Status unknown.",
  "Country": "Syria",
  "ISO": "SY",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "The first three digits of the postal code are required; the last two digits are optional. Codes are known as youdi quhao (郵遞區號), and are also assigned to Senkaku Islands (Diaoyutai), though Japanese-administered, the Pratas Islands and the Spratly Islands. See List of postal codes in Taiwan.",
  "Country": "Taiwan",
  "ISO": "TW",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Retained system from former Soviet Union.",
  "Country": "Tajikistan",
  "ISO": "TJ",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "",
  "Country": "Tanzania",
  "ISO": "TZ",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "The first two specify the province, numbers as in ISO 3166-2:TH, the third and fourth digits specify a district (amphoe)",
  "Country": "Thailand",
  "ISO": "TH",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "Togo",
  "ISO": "TG",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Tokelau",
  "ISO": "TK",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Tonga",
  "ISO": "TO",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "First two digits specify a postal district (one of 72), next two digits a carrier route, last two digits a building or zone along that route",
  "Country": "Trinidad and Tobago",
  "ISO": "TT",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Single code used for all addresses.",
  "Country": "Tristan da Cunha",
  "ISO": "SH",
  "Format": "TDCU 1ZZ",
  "Regex": "^[Tt][Dd][Cc][Uu]\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "",
  "Country": "Tunisia",
  "ISO": "TN",
  "Format": "NNNN",
  "Regex": "^\\d{4}$"
}, {
  "Note": "First two digits are the city numbers.[8]",
  "Country": "Turkey",
  "ISO": "TR",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Retained system from former Soviet Union.",
  "Country": "Turkmenistan",
  "ISO": "TM",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Single code used for all addresses.",
  "Country": "Turks and Caicos Islands",
  "ISO": "TC",
  "Format": "TKCA 1ZZ",
  "Regex": "^[Tt][Kk][Cc][Aa]\\s{0,1}[1][Zz]{2}$"
}, {
  "Note": "",
  "Country": "Tuvalu",
  "ISO": "TV",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Uganda",
  "ISO": "UG",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Ukraine",
  "ISO": "UA",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "",
  "Country": "United Arab Emirates",
  "ISO": "AE",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Known as the postcode. The first letter(s) indicate the postal area, such as the town or part of London. Placed on a separate line below the city (or county, if used). The UK postcode is made up of two parts separated by a space. These are known as the outward postcode and the inward postcode. The outward postcode is always one of the following formats: AN, ANN, AAN, AANN, ANA, AANA, AAA. The inward postcode is always formatted as NAA. A valid inward postcode never contains the letters: C, I, K, M, O or V. The British Forces Post Office has a different system, but as of 2012 has also adopted UK-style postcodes that begin with \"BF1\" for electronic compatibility.",
  "Country": "United Kingdom",
  "ISO": "GB",
  "Format": "A(A)N(A/N)NAA (A[A]N[A/N] NAA)",
  // "Regex": "^[A-Z]{1,2}[0-9R][0-9A-Z]?\\s*[0-9][A-Z-[CIKMOV]]{2}"
  "Regex": "([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})"
  
}, {
  "Note": "Known as the ZIP Code with five digits 99999* or the ZIP+4 Code with nine digits 99999-9999* (while the minimum requirement is the first five digits, the U.S. Postal Service encourages everyone to use all nine). Also used by the former US Pacific Territories: Federated States of Micronesia; Palau; and the Marshall Islands, as well as in current US territories American Samoa, Guam, Northern Mariana Islands, Puerto Rico, and the United States Virgin Islands. An individual delivery point may be represented as an 11-digit number, but these are usually represented by Intelligent Mail barcode or formerly POSTNET bar code.",
  "Country": "United States",
  "ISO": "US",
  "Format": "NNNNN (optionally NNNNN-NNNN)",
  "Regex": "^\\b\\d{5}\\b(?:[- ]{1}\\d{4})?$"
}, {
  "Note": "",
  "Country": "Uruguay",
  "ISO": "UY",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "U.S. ZIP codes. Range 00801 - 00851.",
  "Country": "U.S. Virgin Islands",
  "ISO": "VI",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "Почтовые индексы",
  "Country": "Uzbekistan",
  "ISO": "UZ",
  "Format": "NNN NNN",
  "Regex": "^\\d{3} \\d{3}$"
}, {
  "Note": "",
  "Country": "Vanuatu",
  "ISO": "VU",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "Single code used for all addresses. Part of the Italian postal code system.",
  "Country": "Vatican",
  "ISO": "VA",
  "Format": "120",
  "Regex": "^120$"
}, {
  "Note": "",
  "Country": "Venezuela",
  "ISO": "VE",
  "Format": "NNNN or NNNN A",
  "Regex": "^\\d{4}(\\s[a-zA-Z]{1})?$"
}, {
  "Note": "First two indicate a province.",
  "Country": "Vietnam",
  "ISO": "VN",
  "Format": "NNNNNN",
  "Regex": "^\\d{6}$"
}, {
  "Note": "Overseas Department of France. French codes used. Range 98600 - 98690.",
  "Country": "Wallis and Futuna",
  "ISO": "WF",
  "Format": "986NN",
  "Regex": "^986\\d{2}$"
}, {
  "Note": "System for Sana'a Governorate using geocoding \"عنواني\" based on the OpenPostcode algorithm is inaugurated in 2014.[9]",
  "Country": "Yemen",
  "ISO": "YE",
  "Format": "- no codes -",
  "Regex": ""
}, {
  "Note": "",
  "Country": "Zambia",
  "ISO": "ZM",
  "Format": "NNNNN",
  "Regex": "^\\d{5}$"
}, {
  "Note": "System is being planned.",
  "Country": "Zimbabwe",
  "ISO": "ZW",
  "Format": "- no codes -",
  "Regex": ""
}];


const pincodeDict: CacheType<PincodeType> = {};
Pincodes.forEach(p => pincodeDict[p.ISO] = p);

/**
 * 
 * @param isoCode 2 digit ISO code
 * 
 * Returns a regex string that validates the pincode for the given
 * country code.
 * 
 * If no country is found in the list, returns the regex for the US.
 */
export function regexForIsoCode(isoCode: string): string {
  let pincode = pincodeDict[isoCode.toUpperCase()];

  if (!pincode) {
    return pincodeDict.US.Regex;
  }

  return pincode.Regex;
}

/**
 * Check to see if the pincode regex has numbers only. 
 * This allows us to change the keyboard based on the country
 */
export function regexHasNumbersOnly(regex: string): boolean {
  if (regex.length === 0) {
    return false;
  }

  if (regex.match(/([A-Z])\w+/)) {
    return false;
  } 

  return true;
}

export function validatePincode(isoCode: string, pincode: string): SomeResult<void> {
  const regex = regexForIsoCode(isoCode);
  if (!pincode.match(regex)) {
    return makeError("Pincode is invalid");
  }

  return makeSuccess(undefined);
}

