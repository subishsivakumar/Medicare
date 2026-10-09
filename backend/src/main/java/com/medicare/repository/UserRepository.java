package com.medicare.repository;

import com.medicare.entity.Role;
import com.medicare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserUid(String userUid);
    List<User> findByRole(Role role);
    Boolean existsByEmail(String email);
}
