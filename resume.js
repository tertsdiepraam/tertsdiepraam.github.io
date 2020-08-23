function trimPrefix(str, prefix) {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    } else {
        return str
    }
}

function gen_basics(resume) {
    let basics = resume['basics'];
    return `
<p>
  <strong>Email</strong>: <a href="${basics.email}">${basics.email}</a>
  <br>
  <strong>Phone</strong>: <a href="tel:${basics.phone}">${basics.phone}</a>
  <br>
  <strong>Website</strong>: <a href="${basics.website}">${trimPrefix(basics.website, "https://")}</a>
  <br>
  ${basics.location.address}, ${basics.location.city}, ${basics.location.countryCode}
</p>
`;
}

function gen_work(resume) {
    let work = resume.work;
    let array = []
    let date_options = {month: 'long', year: 'numeric'};
    for (job of work) {
        if (job.endDate === undefined)
            job.endDate = "Present";
        else
            job.endDate = new Date(job.endDate).toLocaleDateString("en-US", date_options);
        job.startDate = new Date(job.startDate).toLocaleDateString("en-US", date_options);
        array.push(`<p><strong>${job.company}, ${job.position}</strong><br><i>${job.startDate} - ${job.endDate}</i><br>\n${job.summary}</p>`)
    }
    return "<h2>Experience</h2>" + array.join('');
}

async function set_resume() {
    let response = await fetch('resume.json');
    console.debug(response);
    let resume = await response.json();
    console.debug(resume);
    TEXT['RESUME'] = "<center><a href='resume.pdf'><button>Download PDF</button></a><a href='resume.json'><button>Download JSON</button></a></center>" + [gen_basics(resume), gen_work(resume)].join('<hr>');
}

set_resume()
