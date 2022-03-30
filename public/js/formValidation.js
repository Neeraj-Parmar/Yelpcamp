const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms)
        .forEach(function (form) {
    form.addEventListener('submit', function (e) {
        if (!form.checkValidity()) {
            e.preventDefault()
            e.stopPropagation()
        }
        form.classList.add('was-validated')
    }, false)
    })