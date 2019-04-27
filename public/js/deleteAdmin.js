function deleteAdmin(id){
    $.ajax({
        url: '/users/admin/manageadminaccounts/' + id,
        type: 'DELETE',
        complete: function(result)
        {
            window.location.reload();
        }
    })
};
