function deleteUser(id){
    $.ajax({
        //url: '/manageuseraccounts/' + id,
        url: '/users/admin/manageuseraccounts/' + id,
        type: 'DELETE',
        complete: function(result){
            window.location.reload();
        }
    })
};
